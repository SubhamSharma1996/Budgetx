
var budgetController = (function() {
       var Expense = function(id,description,value){
           this.id=id;
           this.description=description;
           this.value=value;
           this.percentage = -1;
       };
        
    
       Expense.prototype.calcPercentages = function(totalIncome) {
           if(totalIncome>0)
               {
                   this.percentage = Math.round((this.value / totalIncome) * 100);
               }
           else
               {
                   this.percentage = -1;
               }
       };
    
    
       Expense.prototype.getPercentage = function() {
           return this.percentage;
       }
       var Income = function(id,description,value){
           this.id=id;
           this.description=description;
           this.value=value;
       };
    
     var calculateTotal = function(type) {
         var sum=0;
         data.allItems[type].forEach(function(current, index, array) {
             sum = sum + current.value;
             
         });
         data.totals[type] = sum;
     };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    //creating a public method
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create a newItem based on inc or exp type
            if (type === 'exp')
               {
                newItem = new Expense(ID, des, val);
               }
            else if(type === 'inc')
                {
                    newItem = new Income(ID, des, val);
                }
            //push it into our data structure 
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
                var ids, index;
            
                ids = data.allItems[type].map(function(current) {
                    return current.id;
              });
         
            index = ids.indexOf(id);
            
            if(index !== -1)
                {
                    data.allItems[type].splice(index, 1);   //splice(starting index,no of elements to be removed from index)
                }
            
        },
        
        
        calculateBudget: function() {
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget
            data.budget =  data.totals.inc - data.totals.exp ;
            
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0)
                {     
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                }
            else
                {
                    data.percentage = -1;
                }
            
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.totals.inc);
            });
            
        },
        
        getPercentages : function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
            
        }
    };
})();


var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
       var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            */
            num = Math.abs(num);
            num = num.toFixed(2); //this is a method of number prototype , it always put 2 decimal points in the number
            
            numSplit = num.split('.'); // it splits ans store in an array
            
            int = numSplit[0];
            if(int.length > 3) {
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,int.length); //substr(position,number of strings)
                
            }   
                
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
            
        };
    
       var nodeListForEach = function(list, callback){
                for (var i=0;i<list.length;i++)
                    {
                        callback(list[i],i);
                    }
                
            };
    
    //we need to create a public fuction that can be accessed by the controller function
    return {
        getinput: function() {
            return { //we cannot return 3 variables so made 3 as a part of a object
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //parseFloat converts a string to float
            };   
        },
        addListItem: function(obj , type){
            var html,newHtml,element;
           //Create HTML string with place holder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            //Then we insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
           var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
         var fields, fieldsArr; 
            
           fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
        /*QuerySelectorall returns a list, so we need to convert the list to array using the help of slice method of array.If we trick and pass a list to this method it will return a array.*/
        
           fieldsArr = Array.prototype.slice.call(fields);
        
           fieldsArr.forEach(function (current, index, array) {
                current.value = "";
        
           });
            
            
            
            fieldsArr[0].focus();
        },
         
        displayBudget: function(obj) {
            var type;
            type = obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0)
                {
                   document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
                }
            else
                {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '--';
                }
        },
        
        displayPercentages: function(percentages)
        {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //it returns a node list
            
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index]>0)
                {
                current.textContent = percentages[index] + "%";
                }
                else
                {
                current.textContent = '--'; 
                }
                
            });    
        },
        
        displayMonth: function() {
            var now, months, year, month;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + '  ' + year;
        },
        
        changedType: function() {
          var fields = document.querySelectorAll(DOMstrings.inputType + ',' +
                                                DOMstrings.inputDescription + ',' +
                                                DOMstrings.inputValue);  
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();

//Global App controller
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
         document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        
         document.addEventListener('keypress', function(event) {   //the anonymous function can receive the event argument
            if(event.keyCode === 13 || event.which === 13){
                    ctrlAddItem();
           }
       });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
        
    };
    
    
    var updatePercentages = function()
    {
        //1. Calculate percentages
            budgetCtrl.calculatePercentages();
        
        //2.Read the percentages from the budget controller
            var percentages = budgetCtrl.getPercentages();
        //3.Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }
    var updateBudget = function() {
        
        
        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2.Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3.Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    var ctrlAddItem = function() {
       var input, newItem;
        
        //1.Get the field input data
        input = UICtrl.getinput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0)   //NaN is not a number in JS
        {
            
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        
        //4.Clear the Fields
        UICtrl.clearFields();
        
        //5. Calculate and update the budget
        updateBudget();
        
        //6.Calculate and update percentages
        updatePercentages();
            
        }
        
    };
    
    var ctrlDeleteItem =  function(event){
        
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID)
            {
                //inc-1
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]); //string converted to number using parseInt
                
                
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
                  
            }
    };
    
    //for public we need to return as object
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1  
            });
            setupEventListeners();
        }
    };
   
    
})(budgetController, UIController);


controller.init();







//Subham Sharma






















