class ButtonStyles:
    @classmethod
    def unselected(cls):
        bg_color = "rgb(238, 51, 48);\n"
        color = "rgb(255, 255, 255);\n"
        return cls.__change_color(bg_color=bg_color, color=color)

    @classmethod
    def selected(cls):
        bg_color = "rgb(255, 255, 255);\n"
        color = "rgb(238, 51, 48);\n"
        return cls.__change_color(bg_color=bg_color, color=color)

    @classmethod
    def correct(cls):
        bg_color = "rgb(0, 255, 0);\n"
        color = "rgb(255, 255, 255);\n"
        return cls.__change_color(bg_color=bg_color, color=color)

    @classmethod
    def __change_color(cls, bg_color, color):
        return "text-align:left;\n" \
               f"background-color: {bg_color}" \
               f"color: {color}\n" \
               "border-radius: 180px 40px;\n" \
               "padding-left: 20px;\n"
