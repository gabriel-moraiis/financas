const Form = {

    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    index: document.querySelector("#invisible"),
    

    getValues(){

        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }

    },

    formatValues(){

        let { description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);
        
        console.log(document.querySelector)

        return {
            description,
            amount,
            date,
        }


    },

    validateFields(){

        const { description, amount, date } = Form.getValues();


        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor preencha todos os campos !")
            }

    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event){
        event.preventDefault();
        try {
        // Validar se todos os campos foram digitados
        Form.validateFields();
        // Formatar os valores
        const transaction = Form.formatValues();
        // Salvar a transação
        Transactions.add(transaction);
        // Apagar os dados
        Form.clearFields();
        // Fechar o modal
        Modal.close();
        }
        catch(error) {
            alert(error.message);
        }
    }
}

const Storage = {

    get(){
        return JSON.parse(localStorage.getItem("documents-finances:transactions")) || []
    },

    set(transaction){
        localStorage.setItem("documents-finances:transactions", JSON.stringify(transaction))

    }

}


const DOM = {
    tableContainer: document.querySelector("#data-table tbody"),
    


    addTransaction(transaction, index){

        const tr = document.createElement("tr");

        tr.innerHTML = DOM.innerHtmlTransactions(transaction, index);
        
        tr.dataset.index = index

        DOM.tableContainer.appendChild(tr)

    },



    innerHtmlTransactions(transaction, index){

      const CSSClass = transaction.amount > 0 ? "income" : "expense"

      const amountCurrency = Utils.formatCurrency(transaction.amount) 

      const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSClass}">${amountCurrency}</td>
      <td class="date">${transaction.date}</td>
      <td>
          <img class="remove-transaction" onclick="Transactions.remove(${index})"src="./assets/minus.svg" alt="Remover Transação">
      </td>
      <td>
           <img class="config-transaction" onclick="Transactions.edit(${index})" src="./assets/configuracoes.png" alt="Editar Transação">
      </td>
      <td class="invisible">${index + 1}</td>
      `

      return html
    },

    updateBalance() {
        const cardIncomes = document.querySelector("#incomeDisplay")
        const cardExpenses = document.querySelector("#expenseDisplay")
        const total = document.querySelector("#totalDisplay")
        const arrayIncomes = []
        const arrayExpenses = []
        let incomes = 0
        let expenses = 0
        let balance = 0
       Transactions.transactions.forEach(transaction => {
           if(transaction.amount > 0){
               arrayIncomes.push(transaction.amount)
           } else {
               arrayExpenses.push(transaction.amount)
           }
       }) 
       incomes = arrayIncomes.reduce((acumulador,atual) => acumulador + atual,0)
       expenses = arrayExpenses.reduce((acumulador, atual) => acumulador + atual,0)

       balance = incomes + expenses


       cardIncomes.innerHTML = Utils.formatCurrency(incomes)
       cardExpenses.innerHTML = Utils.formatCurrency(expenses)
       total.innerHTML = Utils.formatCurrency(balance)




    }
    



}



const Transactions = {
    transactions: Storage.get(),

    add(transaction){
        if(Form.index.value == 0){
            this.transactions.push(transaction)
        }
        this.transactions.forEach((e, index) => {
            if(Form.index.value == index+1){
                this.transactions.splice(index, 1, transaction)
                Form.index.value = ""
            }
        })

        App.reload()

    },

    remove(index) {
        Transactions.transactions.splice(index,1)
        App.reload()
    },

    edit(index){
        Modal.open()
        Form.description.value = this.transactions[index].description
        Form.amount.value = (this.transactions[index].amount)/100
        let dateOriginal = Utils.formatDateOriginal(this.transactions[index].date)
        Form.date.value = dateOriginal 
        document.querySelector("#invisible").value = index+1 
    },

    checkExists(index){ 
    this.transactions.forEach((e, indice) => {
        if(index == indice){
            return true
        }else {
            return false
        }
    })

    }


}


const Modal = {

    open() {

        document.querySelector(".modal-overlay")
        .classList
        .add("active")        
    },

    close(){

        document.querySelector(".modal-overlay")
        .classList
        .remove("active")

        Form.clearFields()

    }



}

const Utils = {

    formatAmount(value) {

        value = Number(value.replace(/\,\./g, "")) *100;

        return value;

    },

    formatDateOriginal(value){
        let dateSplit = value.split("/")
        return `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`   
     },

    formatDate(value) {

        const dateSplit = value.split("-");
        
        return `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`

    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-br", {
            style: "currency", 
            currency: "BRL"
        })
        return signal + value
    }

    
        

}

const App = {

    init() {
        Transactions.transactions.sort((a,b) => {
            if(a.date > b.date) return 1;
            if(a.date < b.date) return -1;
            return 0
        })
        Transactions.transactions.forEach((transaction, index) => {
           DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()
        Storage.set(Transactions.transactions)
    },

    reload() {
        DOM.tableContainer.innerHTML = ""
        App.init()
    }

}

App.init();







