const d = document;

let lists = JSON.parse(localStorage.getItem('lists') || "[]");
let card_num = JSON.parse(localStorage.getItem('card_num') || 1);

const btnCreateList = d.getElementById("btn-create-list");
const desk = d.getElementById("desk");
const btnRemoveDesk = d.getElementById("btn-remove-desk");
const inputListName = d.getElementById("list-category");

new Sortable(desk, {
    animation: 150,
    onEnd: function (event) {
        const oldIndex = event.oldIndex;
        const newIndex = event.newIndex;
        arrayMove(lists, oldIndex, newIndex)
        localStorage.setItem('lists', JSON.stringify(lists));
    }
})

// Render existing lists and cards
lists.forEach((list) => {
    outputList(list.id, list.name);
    list.cards.forEach(card => {
        outputCard(list.name, card);
    });
});

function setAtrs(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function addList() {
    let listName = inputListName.value;
    if (listName === '') {
        listName = "Новый список " + card_num;
    }

    lists.push({ id: card_num, name: listName, cards: [] });
    outputList(card_num, listName);

    card_num++;
    localStorage.setItem('card_num', JSON.stringify(card_num));
    localStorage.setItem('lists', JSON.stringify(lists));
    inputListName.value = '';
}

function outputList(id, listName) {
    let list = d.createElement("div");
    let h2 = d.createElement("h2");
    let div = d.createElement("div");
    div.classList.add("list-header");
    let img = d.createElement("img");
    setAtrs(img, { "src": "img/pencil-solid.svg", "alt": "Редактировать название списка", "width": "20px" });
    let list2 = d.createElement("div");     // лист
    list2.classList.add("list-cards");
    let p = d.createElement("p");
    p.textContent = "+ Добавить карточку";
    p.classList.add("add-card");
    let span = d.createElement("span");
    setAtrs(span, { "id": "delete-list" });
    img.classList.add("edit-list");

    h2.innerHTML = listName;

    span.innerHTML = "✖";
    list.append(div);
    div.append(h2);
    div.append(img);
    div.append(span);
    h2.after(img);
    list.append(list2);
    list.append(p);
    list.classList.add("list");
    list.dataset['id'] = id;
    desk.append(list);

    new Sortable(list2, {
        group: 'listCards',
        animation: 150,
        onEnd: function (event) {
            const to = event.to;
            const from = event.from;
            const oldIndex = event.oldIndex;
            const newIndex = event.newIndex;
            const oldParent = Number(from.parentNode.dataset.id);
            const newParent = Number(to.parentNode.dataset.id);

            const oldList = lists.find((i) => i.id === oldParent);
            const newList = lists.find((i) => i.id === newParent);

            if (oldParent !== newParent) {
                newList.cards.push(oldList.cards[oldIndex]);
                oldList.cards.splice(oldIndex, 1);
                arrayMove(newList.cards, newList.cards.length - 1, newIndex)
            } else if (oldIndex !== newIndex) {
                arrayMove(newList.cards, oldIndex, newIndex)
            }

            localStorage.setItem('lists', JSON.stringify(lists));
        }
    })
}

function addCard(listName) {
    let cardText = prompt('Введите текст карточки:');
    if (cardText) {
        let list = lists.find(l => l.name === listName);
        list.cards.push(cardText);
        localStorage.setItem('lists', JSON.stringify(lists));

        outputCard(listName, cardText);
    }
}

function outputCard(listName, cardText) {
    let list = Array.from(desk.querySelectorAll('.list')).find(list => list.querySelector('h2').textContent === listName);
    let listCards = list.querySelector(".list-cards");
    let div = d.createElement("div");
    let textarea = d.createElement("textarea");
    let span = d.createElement("span");

    div.classList.add("card");
    textarea.classList.add("card-text");
    textarea.textContent = cardText;
    span.innerHTML = "✖";
    span.classList.add("delete-text")

    div.append(textarea);
    div.append(span);
    listCards.append(div);
}

function editCard(listName, cardText, newText) {
    let list = lists.find(l => l.name === listName);
    let cardIndex = list.cards.indexOf(cardText);
    list.cards[cardIndex] = newText;
    localStorage.setItem('lists', JSON.stringify(lists));
}

function deleteCard(listName, cardText) {
    let list = lists.find(l => l.name === listName);
    let cardIndex = list.cards.indexOf(cardText);
    list.cards.splice(cardIndex, 1);
    localStorage.setItem('lists', JSON.stringify(lists));
}

btnCreateList.addEventListener("click", addList);

inputListName.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        btnCreateList.click();
    }
});

desk.addEventListener("click", e => {
    if (e.target.classList.contains("edit-list")) {
        let list = e.target.closest(".list");
        let h2 = list.querySelector("h2");
        let newName = prompt('Изменить название списка:', h2.textContent);
        if (newName !== null) {
            let listIndex = lists.findIndex(l => l.name === h2.textContent);
            lists[listIndex].name = newName;
            localStorage.setItem('lists', JSON.stringify(lists));
            h2.textContent = newName;
        }
    }

    if (e.target.id === "delete-list") {
        let list = e.target.closest(".list");
        let listName = list.querySelector("h2").textContent;
        let listIndex = lists.findIndex(l => l.name === listName);
        lists.splice(listIndex, 1);
        localStorage.setItem('lists', JSON.stringify(lists));
        list.remove();
    }

    if (e.target.classList.contains("add-card")) {
        let listName = e.target.closest(".list").querySelector("h2").textContent;
        addCard(listName);
    }

    if (e.target.classList.contains("card-text")) {
        let listName = e.target.closest(".list").querySelector("h2").textContent;
        let cardText = e.target.textContent;
        let newText = prompt('Изменить текст карточки:', cardText);
        if (newText !== null) {
            editCard(listName, cardText, newText);
            e.target.textContent = newText;
        }
    }

    if (e.target.classList.contains("delete-text")) {
        let listName = e.target.closest(".list").querySelector("h2").textContent;
        let cardText = e.target.closest(".card").querySelector(".card-text").textContent;
        deleteCard(listName, cardText);
        e.target.closest(".card").remove();
    }
});

btnRemoveDesk.addEventListener("click", function () {
    desk.innerHTML = "";
    card_num = 1;
    lists = [];
    localStorage.setItem('card_num', JSON.stringify(card_num));
    localStorage.setItem('lists', JSON.stringify(lists));
});

function arrayMove(array, fromIndex, toIndex) {
    const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

    if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

        const [item] = array.splice(fromIndex, 1);
        array.splice(endIndex, 0, item);
    }
}