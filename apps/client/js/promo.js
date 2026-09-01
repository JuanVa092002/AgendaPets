const promo = `<section class="promo">
    <div class="promo__tag"><i class="fa-solid fa-tags"><img src="./assets/logo.png" alt="Logo Agenda Pets"
                class="logo-agenda"></i></div>
    <div class="promo__info"><span class="promo__label">PROMOCIÓN DEL MES</span>
        <h2>Baño + Corte</h2>
        <p>Mimos completos para que tu mascota luzca hermosa y feliz.</p>
    </div>
    <div class="promo__discount"><span class="promo__number">20%</span><span class="promo__off">OFF</span><small>Por
            tiempo limitado</small></div>
    <div class="promo__count">
        <p>Termina en:</p>
        <div class="promo__timer">
           <div><span id="dias">00</span><small>Días</small></div>
<div><span id="horas">00</span><small>Horas</small></div>
<div><span id="minutos">00</span><small>Min</small></div>
<div><span id="segundos">00</span><small>Seg</small></div>
        </div>
    </div>
    <div class="promo__action"><button class="promo__button">Aprovechar promoción <i
                class="fa-solid fa-paw"></i></button><a href="#">Ver todas las promociones →</a></div>
</section>
`

document.getElementById("promo").innerHTML = promo


const finPromo=new Date("2026-09-03T23:59:59").getTime();

const dias=document.getElementById("dias");
const horas=document.getElementById("horas");
const minutos=document.getElementById("minutos");
const segundos=document.getElementById("segundos");

function actualizarContador(){

const ahora=new Date().getTime();

const diferencia=finPromo-ahora;

if(diferencia<=0){

dias.textContent="00";
horas.textContent="00";
minutos.textContent="00";
segundos.textContent="00";

return;

}

const d=Math.floor(diferencia/(1000*60*60*24));

const h=Math.floor((diferencia%(1000*60*60*24))/(1000*60*60));

const m=Math.floor((diferencia%(1000*60*60))/(1000*60));

const s=Math.floor((diferencia%(1000*60))/1000);

dias.textContent=String(d).padStart(2,"0");
horas.textContent=String(h).padStart(2,"0");
minutos.textContent=String(m).padStart(2,"0");
segundos.textContent=String(s).padStart(2,"0");

//ANIMACION FLIP CONTEO DE MINUTOS Y SEGUNDOS
[minutos,segundos].forEach(el=>{
el.classList.remove("flip");
void el.offsetWidth;
el.classList.add("flip");
});
}

actualizarContador();

setInterval(actualizarContador,1000);