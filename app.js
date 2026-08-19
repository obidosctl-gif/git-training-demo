async function loadEmployees() {
    const response = await fetch("employees.json");
    const employees = await response.json();

    const list = document.getElementById("employee-list");

    employees.forEach(employee => {
        const item = document.createElement("li");
        item.textContent = `${employee.name} - ${employee.role}`;
        list.appendChild(item);
    });
}

function showMessage() {
    document.getElementById("welcome").textContent =
        "Git change successfully applied!";
}

loadEmployees();
