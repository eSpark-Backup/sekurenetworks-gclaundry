import os
import shutil
import subprocess
import threading
import time
import zipfile
from io import BytesIO
from pathlib import Path

import requests

from config import config
from constants import BASE_DIR, DEPS_SCRIPT, OTA_INTERVAL, REPO_URL, REPO_URL_DEV, VERSION_FILE
from src.ctrl import ctrl
from src.logger import getLogger
logger = getLogger(__name__)


class OtaService(threading.Thread):

    def __init__(self):
        super().__init__(name="OtaService", daemon=True)

    def get_latest_version_from_github(self) -> dict | None:
        return self.get_latest_version_from_github_dev() if config().is_dev else self.get_latest_version_from_github_production() 

    def get_latest_version_from_github_production(self):
        payload = {}
        headers = {
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {config().github_token}',
            'X-GitHub-Api-Version': '2022-11-28'
        }
        response = requests.request("GET", REPO_URL, headers=headers, data=payload)
        response.raise_for_status()
        latest_release = response.json()

        if 'tag_name' in latest_release:
            return latest_release
        logger.warning('No releases found in git')

    
    def get_latest_version_from_github_dev(self):
        payload = {}
        headers = {
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {config().github_token}',
            'X-GitHub-Api-Version': '2022-11-28'
        }
        response = requests.request("GET", REPO_URL_DEV, headers=headers, data=payload)
        response.raise_for_status()
        latest_release = response.json()[0]
        if latest_release["prerelease"]:
            logger.log("Pre Release Found....")

        if 'tag_name' in latest_release:
            logger.log(f"Release found {latest_release['tag_name']}")
            return latest_release
        logger.warning('No releases found in git')



    def install_release(self, release_dir, release_obj):
        dest_dir = f"{Path.home()}/LK-Dispense" # TODO use `REPO_NAME`  but name change will mess up the updater 
        
        # Check if destination directory exists
        if not os.path.exists(dest_dir):
            shutil.copytree(release_dir, dest_dir)
        else:
            # If it exists, update files or copy missing ones
            for root, dirs, files in os.walk(release_dir):
                dest_root = root.replace(release_dir, dest_dir, 1)

                # Ensure the destination directory exists
                if not os.path.exists(dest_root):
                    os.makedirs(dest_root)

                # Copy files
                for file in files:
                    src_file = os.path.join(root, file)
                    dest_file = os.path.join(dest_root, file)

                    # Copy the file, overwriting the destination file if it exists
                    shutil.copy2(src_file, dest_file)

        # self.handle_process(subprocess.run(['sudo', 'cp', f"{dest_dir}/.env.prod", f"{dest_dir}/.env"],stdout=subprocess.PIPE,stderr=subprocess.PIPE))
        
        if os.path.exists(DEPS_SCRIPT):
            self.handle_process(subprocess.run(['chmod', "+x", DEPS_SCRIPT],stdout=subprocess.PIPE,stderr=subprocess.PIPE))
            self.handle_process(subprocess.run([DEPS_SCRIPT],shell=True, stdout=subprocess.PIPE,stderr=subprocess.PIPE))

        self.handle_process(subprocess.run([
            "sudo", 
            "pip3", 
            "install" ,
            "-r", 
            f"{BASE_DIR}/requirements.txt", 
            "--break-system-packages",
            "--no-input", 
            "--upgrade"
            ],stdout=subprocess.PIPE,stderr=subprocess.PIPE))

        # Update Version File at last
        with open(VERSION_FILE, "w") as f: 
            f.write(release_obj['tag_name'])
        
        return True

    def handle_process(self,process : subprocess.CompletedProcess[bytes] ):
        logger.log(process.args)
        logger.log(process.stdout)
        if process.stderr:
            logger.error(process.stderr)
        logger.log(process.returncode)
        process.check_returncode()

    def download_release(self, release_data):
        headers = {
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {config().github_token}',
            'X-GitHub-Api-Version': '2022-11-28'
        }
        # Find the download URL for the specific file
        zipball_url = release_data.get("zipball_url", None)

        if zipball_url is not None:
            # Download the file
            download_response = requests.get(zipball_url, headers=headers)

            extract_dir = f"{Path.home()}/{release_data['id']}"

            with zipfile.ZipFile(BytesIO(download_response.content)) as zip_ref:
                zip_ref.extractall(extract_dir)
                return os.path.join(extract_dir, os.listdir(extract_dir)[0])

        
    def safe_reboot(self):
        while ctrl().is_active:
            logger.log("Delaying Reboot machine is busy...")
            time.sleep(3)

        time.sleep(3)
        logger.log("Rebooting....")
        self.handle_process(subprocess.run(["sudo", "reboot"],stdout=subprocess.PIPE,stderr=subprocess.PIPE))

    def delete_temp(self, dir):
        shutil.rmtree(dir)
        logger.log("Deleted old release")
    
    def run(self):
        while True:
            try:
                latest_release = self.get_latest_version_from_github()
                if latest_release is not None and latest_release['tag_name'] != config().version:
                    
                    logger.log(f"Release found {latest_release['tag_name']}")
                    logger.debug(f"{latest_release=}")
                    logger.success("Downloading update...")
                    release = self.download_release(latest_release)

                    if release is not None:
                        logger.log("Installing release...")
                        install_succeeded = self.install_release(release,latest_release)

                        if not install_succeeded:
                            logger.warning("will retry after 30 sec")
                            time.sleep(30)
                            continue
                        
                        self.delete_temp(release)
                        self.safe_reboot()

                    else:
                        logger.error('Error occurred in download zip. Zip address is None')
            except Exception as e:
                logger.error('error getting updates', e)

            time.sleep(OTA_INTERVAL)
