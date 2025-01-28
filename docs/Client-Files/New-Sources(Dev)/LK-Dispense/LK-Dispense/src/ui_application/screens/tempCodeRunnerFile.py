
            QtCore.QEvent.MouseButtonPress,
            button_center,
            QtCore.Qt.LeftButton,
            QtCore.Qt.LeftButton,
            QtCore.Qt.NoModifier,
        )
        QtWidgets.QApplication.postEvent(self.screen_.email_input, mouse_event)

    @property
    def password(self) -> str:
        # return self.screen_.password_input.text()
        return ""

    @property
    def email(self) -> str:
        return self.screen_.email_input.text()

    def clear_error_message(self):
        return self.screen_.error_message.setText("")