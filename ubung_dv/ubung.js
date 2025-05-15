
let myObjectArr = [
    {
        "name":"Max",
        "is_a_good_guy": true
    },
    {
        "name":"Peter",
        "is_a_good_guy": false
    },
    {
        "name":"Arnold",
        "is_a_good_guy": true
    },
    {
        "name":"Justus",
        "is_a_good_guy": true
    },
    {
        "name":"Bombur",
        "is_a_good_guy": false
    }
];

console.log(
    myObjectArr.filter((element) => {return element['is_a_good_guy'] == true})
);
