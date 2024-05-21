var navContainer = document.getElementById("navbar-selections");

var navButtons = navContainer.getElementsByClassName("nav-link");

for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
    });
}