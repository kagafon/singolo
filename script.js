const slides = document.querySelectorAll(".slide");
const slidesContainer = document.querySelector(".slider__content");
const galleryItems = [...document.querySelectorAll(".gallery__item")];
const galleryContainer = document.querySelector(".gallery__content");

const headerSize = 95;
let currentGalleryOrder = [...Array(12)].map((el, idx) => idx);
let activeSlideIdx = 0;
let disableSlideControls = false;
let prevYOffset = 0;

/* Helpers */
const setOnlyOneActive = (element, selectClassName, container, activeClassName) => {
    if (activeClassName === undefined) activeClassName = selectClassName + "_active";
    if (container === undefined) container = document;
    container.querySelectorAll("."+selectClassName).forEach(el => el.classList.remove(activeClassName));
    element.classList.add(activeClassName);
};

const scrollHandler = () => {
    let sectionsArray = [];
    const sectionPositions =[...document.querySelectorAll(".header__navigation__item > a")].reduce((res, navItem) => {
        let targetElement = document.getElementById(navItem.getAttribute("href").substring(1));
        if (targetElement){
            res[navItem.getAttribute("href")] = {
                'top': targetElement.offsetTop, 
                'height': targetElement.offsetHeight,
                'bottom': targetElement.offsetTop + targetElement.offsetHeight,
                'middle': targetElement.offsetTop + targetElement.offsetHeight/2,
                'navItem': navItem.parentElement
            }
        }
        return res;}, {});
    if (prevYOffset > pageYOffset){
        //Scrolling up
        Object.values(sectionPositions).some((x, idx) => {
            /* If top of section is visible - set it active */
            if (x.top >= pageYOffset && x.top < pageYOffset + innerHeight
                || x.top <= pageYOffset && x.bottom >= pageYOffset + innerHeight){
                setOnlyOneActive(x.navItem, "header__navigation__item");
                return true;
            }
        });
    }
    else
    {
        //Scrolling down
        /* Go from the last section */
        Object.values(sectionPositions).reverse().some((x, idx) => {
            if (idx == 0){
                /* if last section is all on screen - make it active */
                if (x.bottom <= pageYOffset + innerHeight){
                    setOnlyOneActive(x.navItem, "header__navigation__item");
                    return true;
                }
            }
            if (x.height > innerHeight){
                /* if section height greater then screen size
                    and sections top is in the higher part of screen - make it active */
                if (x.top <= pageYOffset + innerHeight / 2 && x.top > pageYOffset + headerSize){
                    setOnlyOneActive(x.navItem, "header__navigation__item");
                    return true;
                }                                
            }
            else{
                /* if section height less then screen size
                    and sections middle is in the higher part of screen - make it active */
                    if (x.middle <= pageYOffset + innerHeight * 2 / 3 && x.middle > pageYOffset){
                    setOnlyOneActive(x.navItem, "header__navigation__item");
                    return true;
                }
            }
            return false;
        });
    }
    prevYOffset = pageYOffset;
};

/* Navigation */
document.querySelector(".header__navigation").addEventListener("click", (event) => {
    if (event.target.parentElement.classList.contains("header__navigation__item")){
        document.querySelector(".header__mobile-menu-btn").classList.remove("header__mobile-menu-btn_open");
        document.querySelector(".header__navigation").classList.remove("header__navigation_shown");
        document.querySelector(".header__logo").classList.remove("header__logo_mobile-menu-open");    
    }
});

document.querySelector(".header__mobile-menu-btn").addEventListener("click", (event) => {
    event.currentTarget.classList.toggle("header__mobile-menu-btn_open");
    document.querySelector(".header__navigation").classList.toggle("header__navigation_shown");
    document.querySelector(".header__logo").classList.toggle("header__logo_mobile-menu-open");
    
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 768){
        document.querySelector(".header__mobile-menu-btn").classList.remove("header__mobile-menu-btn_open");
        document.querySelector(".header__navigation").classList.remove("header__navigation_shown");
        document.querySelector(".header__logo").classList.remove("header__logo_mobile-menu-open");    
    }
    scrollHandler();
});

window.addEventListener("scroll", scrollHandler);
scrollHandler();

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
        
        targetSlide.style.left = (targetSlide.offsetWidth * direction)+"px";
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
};
if ("ontouchstart" in document.documentElement){
    document.querySelector(".slider__control_left").addEventListener("touchend", createSlideHandler(-1));
    document.querySelector(".slider__control_right").addEventListener("touchend", createSlideHandler(1));
}
else
{
    document.querySelector(".slider__control_left").addEventListener("click", createSlideHandler(-1));
    document.querySelector(".slider__control_right").addEventListener("click", createSlideHandler(1));
}

/* Gallery */
document.querySelector(".gallery__filter").addEventListener("click", (event) => {
    if (event.target.classList.contains("gallery__filter__button")
        && !event.target.classList.contains("gallery__filter__button_active")){
        setOnlyOneActive(event.target, "gallery__filter__button", event.currentTarget);
        if (event.target.dataset.filter){
            /* Ensure shuffling */
            const newGalleryOrder = [...currentGalleryOrder];
            while(newGalleryOrder.some((val, idx) => currentGalleryOrder[idx] == val)){
                newGalleryOrder.sort((a, b) => Math.random()-0.5);
            }
            galleryContainer.animate(
                [{opacity:1}, {opacity: 0}], 
                {
                    duration: 500,
                    easing: "ease-out",
            });

            galleryItems.forEach(x => {x.classList.remove("gallery__item_active");x.remove();});
            newGalleryOrder.forEach(x => galleryContainer.appendChild(galleryItems[x]));
            galleryContainer.animate(
                [{opacity:0}, {opacity: 1}], 
                {
                    duration: 500,
                    easing: "ease-out",
            });            
            currentGalleryOrder = newGalleryOrder;
        }
    }
});

document.querySelector(".gallery__content").addEventListener("click", (event) => {
    if (event.target.parentElement.classList.contains("gallery__item")){
        if (event.target.parentElement.classList.contains("gallery__item_active")){
            event.target.parentElement.classList.remove("gallery__item_active");
        }
        else{
            setOnlyOneActive(event.target.parentElement, "gallery__item", event.currentTarget);
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

document.querySelector(".modal-window__close").addEventListener('click', (event) =>{
    document.querySelector(".modal-window").classList.remove("modal-window_shown");
    document.querySelector(".get-a-quote-form").reset();
});
