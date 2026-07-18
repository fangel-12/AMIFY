const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }

    });
},{
    threshold:0.15
});

const links = document.querySelectorAll(".site-nav a");

links.forEach(link=>{

    if(link.href===window.location.href){
        link.classList.add("active");
    }

});

const header=document.querySelector(".site-header");

window.addEventListener("scroll",()=>{

    if(window.scrollY>50){

        header.style.boxShadow="0 12px 30px rgba(172, 17, 17, 0.33)";

    }

    else{

        header.style.boxShadow="none";

    }

});

document.querySelectorAll(".offer-card").forEach(card=>{

    card.addEventListener("mousemove",(e)=>{

        const rect=card.getBoundingClientRect();

        const x=e.clientX-rect.left;
        const y=e.clientY-rect.top;

        card.style.background=
        `radial-gradient(circle at ${x}px ${y}px,
        rgba(201,138,59,.18),
        white 60%)`;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.background="white";

    });

});

const hero = document.querySelector(".hero-card");

if(hero){

hero.addEventListener("mousemove",(e)=>{

const rect=hero.getBoundingClientRect();

const x=e.clientX-rect.left;
const y=e.clientY-rect.top;

const rotateY=((x-rect.width/2)/18);

const rotateX=((rect.height/2-y)/18);

hero.style.transform=
`rotateX(${rotateX}deg)
 rotateY(${rotateY}deg)`;

});

hero.addEventListener("mouseleave",()=>{

hero.style.transform="rotateX(0) rotateY(0)";

});

}