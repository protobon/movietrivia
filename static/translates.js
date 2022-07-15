function delay(n) {
    n = n || 2000;
    return new Promise((done) => {
        setTimeout(() => {
            done();
        }, n);
    })
}

function pageTransition() {
 var tl = gsap.timeline();

 tl.to(".loading-screen",{
    duration: 1.2,
    width: "100%",
    left: "0%",
    ease: "Expo.easeInOut"
 });

 tl.to(".loading-screen",{
    duration: 1.2,
    width: "100%",
    left: "100%",
    ease: "Expo.easeInOut",
    delay: 0.3
});
    tl.set(".loading-screen", { left: "-100%"});
}