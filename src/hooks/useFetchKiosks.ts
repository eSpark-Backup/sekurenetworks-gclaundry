import { getAllKioskData } from "@/api/kiosk";
import { useState, useEffect } from "react";


const useFetchKiosks = () => {
    const [kiosks, setKiosks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKiosks = async () => {
            try {
                const res = await getAllKioskData();
                setKiosks(res || []);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchKiosks();
    }, [getAllKioskData]);

    return { kiosks, isLoading, error };
};

export default useFetchKiosks;
