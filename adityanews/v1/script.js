// const initialFacts=[
//     {
//         id:1,
//         text:"React is developed by Meta(formerly facebook)",
//         source:"https://opensource.fb.com/",
//         category:"technology",
//         votesInteresting:24,
//         votesMindblowing:9,
//         votesFalse:4,
//         createdIn:2021,
//     },
//     {
//         id:2,
//         text:"Millenial dads spend 3 times as such time with their kids than their father spent with time,In 1992,43% of fathers had never changed a diaper,Today,that number is down to 3% ",
//         source:"https://www.mother.ly/parenting/millenial-dads-spend-more-time-with-their-kids",
//         category:"society",
//         votesInteresting:11,
//         votesMindblowing:2,
//         votesFalse:0,
//         createdIn:2019,
//     },
//     {
//     id:3,
//         text:"Lisbon is the capital of Portugal",
//         source:"https://en.wikipedia.org/wiki/Lisbon",
//         category:"society",
//         votesInteresting:8,
//         votesMindblowing:3,
//         votesFalse:1,
//         createdIn:2015,
//     },
// ];

const CATEGORIES=[
    {name: "technology",color: "#3b82f6"},
    {name: "science",color: "#16a34a"},
    {name: "finance",color: "#ef4444"},
    {name: "society",color: "#eab30B"},
    {name: "entertainment",color: "#db2777"},
    {name: "health",color: "#14b8a6"},
    {name: "history",color: "#f97316"},
    {name: "news",color: "#8b5cf6"},

];

// selecting the  DOM elements
const btn=document.querySelector(".btn-open");
const form=document.querySelector('.fact-form')

const factsList=document.querySelector(".facts-list");
//    create DOM elements:Render facts in list    ( to remove html contents)

factsList.innerHTML="";

// load data from supabase

loadFacts();
async function loadFacts(){
    const res= await fetch("https://youmwbnhhyosmlvdqkly.supabase.co/rest/v1/facts",
    {
    headers:{
        apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdW13Ym5oaHlvc21sdmRxa2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ4MTAxMjUsImV4cCI6MjAzMDM4NjEyNX0.kkj7XzUBnNzwYCLvDUZ8_mI1VHGxEx_5CV19I5bWkec",
        authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdW13Ym5oaHlvc21sdmRxa2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ4MTAxMjUsImV4cCI6MjAzMDM4NjEyNX0.kkj7XzUBnNzwYCLvDUZ8_mI1VHGxEx_5CV19I5bWkec",
    },
}
);
const data=await res.json();
console.log(data);
// const filteredData=data.filter((fact)=>fact.category==="technology");

createFactsList(data);
}

function createFactsList(dataArray) {
    const htmlArr = dataArray.map((fact) => {
        const category = CATEGORIES.find((cat) => cat.name === fact.category);
        const backgroundColor = category ? category.color : "#000000"; // Default color if category not found
        return `<li class="fact">
            <p>
                ${fact.text}
                <a class="source" href="${fact.source}" target="_blank">(Source)</a>
            </p>
            <span class="tag" style="background-color: ${backgroundColor}">${fact.category}</span>
        </li>`;
    });

    const html = htmlArr.join("");

    factsList.insertAdjacentHTML("afterbegin", html);
}




//    Toggle form visibility
btn.addEventListener("click",function(){
   
    if(form.classList.contains("hidden")){
        form.classList.remove("hidden");
        btn.textContent="CLOSE"
    }else{
        form.classList.add("hidden");
        btn.textContent="share a fact";
    }

});

// console.log([7,64,6,-23,11].filter((el)=>el>10));

// console.log([7,64,6,-23,11].find((el)=>el>10));



// let votesInteresting=23;
// let votesMindblowing=5;
// const text='Lisbon is the capital of Portugal';
// votesInteresting++;
// console.log(votesInteresting);

// let totalUpvotes=votesInteresting+votesMindblowing;
// console.log(totalUpvotes);

// let votesFalse=4;
// const isCorrect=votesFalse<totalUpvotes;
// console.log(isCorrect);

// function calcFactAge(year){
//     const currentYear=new Date().getFullYear();
//     const age=currentYear-year;
//     if(age>=0)
//         return age;
//     else return `Impossible Year. Year needs to be less or equal to ${currentYear}`;
// }

// const age1=calcFactAge(2015);
// console.log(age1);
// console.log(calcFactAge(2020));

// // const calcFactAge1=(year)=>2022-year;
// const calcFactAge2=(year) => year <= new Date().getFullYear() ? new Date().getFullYear()-year : `Impossible Year. Year needs to be less or equal to ${new Date().getFullYear()}`;

// console.log(calcFactAge(2015));

// let votesInteresting=20;
// let votesMindblowing=5;

// if(votesInteresting===votesMindblowing){
//     alert("this fact is equally interesting and mindblowing");
// }else if(votesInteresting>votesMindblowing){
//     console.log("Interesting Fact");
// }else if(votesInteresting<votesMindblowing){
//     console.log("Mindblowing Fact");
// }

// falsy values : 0,'',null,undefined

// truthy values
// if(votesMindblowing){
//     console.log("MINDBLOWING FACT!!");
// }else{
//     console.log("Not so special");
// }

// let votesFalse=7;
// const totalUpvotes=votesInteresting+votesMindblowing;
// const message =
// totalUpvotes>votesFalse
// ? "The fact is true"
// :"Might be false,check more sources...";
// // alert(message);

// const text='Lisbon is the capital of Portugal';
// const upperText=text.toUpperCase();
// console.log(upperText);

// const str=`The current fact is ${text}, It is ${calcFactAge(2015)} years old.It is probably ${totalUpvotes>votesFalse? "correct":"not true"}.`;
// console.log(str);

// const fact2=["Lisbon is the capital of Portugal",2015,true];
// console.log(fact2);
// console.log(fact2[0]);
// console.log(fact2.length);
// console.log(fact2[fact2.length-1]);

// //        structuring
// const [text,createdIn]=fact2;
// console.log(createdIn);
// //     ... spread opeartor
// const newFact=[...fact2,"society"];
// console.log(newFact);

//    object
// const factObj={
//     text:'Lisbon is the capital of Portugal',
//     category:"society",
//     createdIn:2015,
//     isCorrect:true,
//     createSummary:function(){
//         return `The fact "${this.text}" is from the category ${this.category.toUpperCase()}`;   
//     },
// };
// console.log(factObj);
// console.log(factObj["text"]);

// const{category, isCorrect}=factObj;
// console.log(category);
// console.log(factObj.createSummary());

// [2,4,6,8].forEach(function(el){
//     console.log(el);
// });

// const times10=[2,4,6,8].map(function(el){
//     return el*10;
// // });
// const times10=[2,4,6,8].map((el)=>el*10);
// console.log(times10);

