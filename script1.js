class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    compute() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    alert('Ошибка: деление на ноль!');
                    this.clear();
                    return;
                }
                result = prev / current;
                break;
            case '%':
                result = prev % current;
                break;
            default:
                return;
        }
        
        this.currentOperand = result.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
    
    addAnimation(button) {
        button.classList.add('btn-click');
        setTimeout(() => {
            button.classList.remove('btn-click');
        }, 100);
    }
}

// Инициализация
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Обработчики событий для чисел
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.addAnimation(button);
        calculator.appendNumber(button.dataset.number);
    });
});

// Обработчики для операторов
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.addAnimation(button);
        calculator.chooseOperation(button.dataset.operator);
    });
});

// Обработчик для очистки
document.querySelector('[data-action="clear"]').addEventListener('click', (button) => {
    calculator.addAnimation(button.target);
    calculator.clear();
});

// Обработчик для удаления
document.querySelector('[data-action="delete"]').addEventListener('click', (button) => {
    calculator.addAnimation(button.target);
    calculator.delete();
});

// Обработчик для вычисления
document.querySelector('[data-action="equals"]').addEventListener('click', (button) => {
    calculator.addAnimation(button.target);
    calculator.compute();
});

// Поддержка клавиатуры
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Цифры
    if (/[0-9]/.test(key)) {
        calculator.appendNumber(key);
        document.querySelector(`[data-number="${key}"]`).classList.add('btn-click');
        setTimeout(() => {
            document.querySelector(`[data-number="${key}"]`).classList.remove('btn-click');
        }, 100);
    }
    
    // Точка
    if (key === '.') {
        calculator.appendNumber('.');
    }
    
    // Операторы
    if (key === '+') calculator.chooseOperation('+');
    if (key === '-') calculator.chooseOperation('-');
    if (key === '*') calculator.chooseOperation('*');
    if (key === '/') {
        event.preventDefault();
        calculator.chooseOperation('/');
    }
    if (key === '%') calculator.chooseOperation('%');
    
    // Вычисление
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculator.compute();
    }
    
    // Очистка
    if (key === 'Escape') {
        calculator.clear();
    }
    
    // Удаление
    if (key === 'Backspace') {
        calculator.delete();
    }
});