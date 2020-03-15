const slides = document.querySelectorAll(".slide");
const slidesContainer = document.querySelector(".slider__content");
const galleryImages = [...Array(12)].map((el, idx) => {
    return { "src": `assets/portfolio-${idx + 1}.png`, "alt": `Portfolio ${idx + 1}`};
});
const galleryPlaceholders = [...document.querySelectorAll(".gallery__item")];
let currentGalleryOrder = [...Array(12)].map((el, idx) => idx);
let activeSlideIdx = 0;
let disableSlideControls = false;

/* Helpers */
const setOnlyOneActive = (element, selectClassName, container, activeClassName) => {
    if (activeClassName === undefined) activeClassName = selectClassName + "_active";
    if (container === undefined) container = document;
    container.querySelectorAll("."+selectClassName).forEach(el => el.classList.remove(activeClassName));
    element.classList.add(activeClassName);
}

/* Navigation */
document.querySelector(".header__navigation > ul").addEventListener("click", (event) => {
    if (event.target.parentElement.classList.contains("header__navigation__item")){
        let href = event.target.getAttribute("href")
        if (href.startsWith("#") && href.length > 1){
            const targetElement = document.getElementById(href.substring(1));
            if (targetElement){
                window.scrollTo(0, targetElement.offsetTop - document.querySelector("header").clientHeight);
                event.preventDefault();
                setOnlyOneActive(event.target.parentElement, "header__navigation__item");
            }
        }
    }
})

/* Screen blackout */
document.querySelectorAll(".iphone__button").forEach(btn => btn.addEventListener("click", (event) => {
    btn.parentElement.querySelector(".iphone__screen").classList.toggle("iphone__screen_blackout");
}));

/* Carousel */
const createSlideHandler = (direction) => {
    return slideHandler = (event) => {
        event.preventDefault();
        if (disableSlideControls) return;
        disableSlideControls = true;
        const currentSlide = slides[activeSlideIdx];

        activeSlideIdx += direction;
        if (activeSlideIdx < 0) activeSlideIdx += slides.length;
        if (activeSlideIdx >= slides.length ) activeSlideIdx -= slides.length;

        let targetSlide = slides[activeSlideIdx];
        
        targetSlide.style.left = (1020 * direction)+"px";
        targetSlide.style.zIndex = 50; 
        const animation = new Animation(new KeyframeEffect(targetSlide, [
            {left: targetSlide.style.left},
            {left: "0"}
        ], {
            duration: 700,
            easing: "ease-out",
        }));
        animation.onfinish = () => {
            targetSlide.classList.add("slide_active");
            currentSlide.classList.remove("slide_active");
            targetSlide.style = "";
            disableSlideControls = false;
        };
        animation.play();
    };
}

document.querySelector(".slider__control_left").addEventListener("click", createSlideHandler(-1));
document.querySelector(".slider__control_right").addEventListener("click", createSlideHandler(1));

/* Gallery */
const reloadGallery = (filter) => {
    if (filter){
        /* Ensure shuffling */
        const newGalleryOrder = [...currentGalleryOrder];
        while(newGalleryOrder.some((val, idx) => currentGalleryOrder[idx] == val)){
            newGalleryOrder.sort((a, b) => Math.random()-0.5);
        }

        galleryPlaceholders.forEach((placeholder, idx) => {
            placeholder.classList.remove("gallery__item_active")
            placeholder.style.order = newGalleryOrder[idx];
            placeholder.animate([
                {opacity:0},
                {src: galleryImages[currentGalleryOrder[idx]].src},
                {src: galleryImages[newGalleryOrder[idx]].src},
                {opacity: 1}
            ], {
                duration: 500,
                easing: "ease-out",
            });
            });
        currentGalleryOrder = newGalleryOrder;
    }
}

document.querySelector(".gallery__filter").addEventListener("click", (event) => {
    if (event.target.classList.contains("gallery__filter__button") 
        && !event.target.classList.contains("gallery__filter__button_active")){
        setOnlyOneActive(event.target, "gallery__filter__button", event.currentTarget);
        reloadGallery(event.target.dataset.filter);
    }
});

document.querySelector(".gallery__content").addEventListener("click", (event) => {
    if (event.target.classList.contains("gallery__item")){
        if (event.target.classList.contains("gallery__item_active")){
            event.target.classList.remove("gallery__item_active");
        }
        else{
            setOnlyOneActive(event.target, "gallery__item", event.currentTarget);
        }
    }
});

/* Form */
document.querySelector(".get-a-quote-form").addEventListener("submit", (event) => {
    const form = event.target;
    document.querySelector(".modal-window__field_subject").innerText = 
                    form.elements["subject"].value.trim() ? "Тема: " + form.elements["subject"].value.trim() : "Без темы";
    document.querySelector(".modal-window__field_description").innerText = 
                    form.elements["description"].value.trim() ? "Описание: " + form.elements["description"].value.trim() : "Без описания";
    document.querySelector(".modal-window").classList.add("modal-window_shown");
    event.preventDefault();
});

document.querySelector(".modal-window__field_close").addEventListener('click', (event) =>{
    document.querySelector(".modal-window").classList.remove("modal-window_shown");
});
