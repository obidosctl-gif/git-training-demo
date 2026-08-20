const STORAGE_KEY = "git-training-tasks";

let employees = [];
let tasks = [];
let statusFilter = "all";

async function init() {
    const employeeResponse = await fetch("employees.json");
    employees = await employeeResponse.json();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        const taskResponse = await fetch("tasks.json");
        tasks = await taskResponse.json();
        saveTasks();
    }

    fillAssigneeOptions();
    renderTeam();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getEmployee(id) {
    return employees.find(employee => employee.id === id);
}

function badgeClass(role) {
    const value = role.toLowerCase();
    if (value.includes("intern")) {
        return "badge intern";
    }
    if (value.includes("developer")) {
        return "badge developer";
    }
    return "badge other";
}

function fillAssigneeOptions() {
    const select = document.getElementById("task-assignee");
    select.innerHTML = "";
    employees.forEach(employee => {
        const option = document.createElement("option");
        option.value = String(employee.id);
        option.textContent = employee.name;
        select.appendChild(option);
    });
}

function renderTeam() {
    const list = document.getElementById("employee-list");
    list.innerHTML = "";
    document.getElementById("stat-team").textContent = String(employees.length);

    employees.forEach(employee => {
        const openCount = tasks.filter(task => task.assigneeId === employee.id && task.status !== "done").length;
        const item = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = employee.name;

        const meta = document.createElement("span");
        meta.className = "team-meta";

        const badge = document.createElement("span");
        badge.className = badgeClass(employee.role);
        badge.textContent = employee.role;

        const workload = document.createElement("small");
        workload.textContent = openCount === 1 ? "1 open task" : `${openCount} open tasks`;

        meta.appendChild(badge);
        meta.appendChild(workload);
        item.appendChild(name);
        item.appendChild(meta);
        list.appendChild(item);
    });
}

function updateStats() {
    const done = tasks.filter(task => task.status === "done").length;
    const open = tasks.length - done;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    document.getElementById("stat-open").textContent = String(open);
    document.getElementById("stat-done").textContent = String(done);
    document.getElementById("progress-label").textContent = `${done} of ${tasks.length} complete`;
    document.getElementById("progress-bar").style.width = `${percent}%`;
}

function renderTasks() {
    const list = document.getElementById("task-list");
    list.innerHTML = "";
    updateStats();
    renderTeam();

    const visible = tasks.filter(task => statusFilter === "all" || task.status === statusFilter);

    if (!visible.length) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No tasks in this view.";
        list.appendChild(empty);
        return;
    }

    visible.forEach(task => {
        const assignee = getEmployee(task.assigneeId);
        const item = document.createElement("li");
        item.className = "task-item";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        const who = document.createElement("p");
        who.className = "task-assignee";
        who.textContent = `Assigned to ${assignee ? assignee.name : "Unassigned"}`;

        const status = document.createElement("select");
        status.setAttribute("aria-label", `Status for ${task.title}`);
        ["todo", "in-progress", "done"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value === "in-progress" ? "In progress" : value === "done" ? "Done" : "To do";
            if (task.status === value) {
                option.selected = true;
            }
            status.appendChild(option);
        });
        status.addEventListener("change", () => {
            task.status = status.value;
            saveTasks();
            renderTasks();
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "link-btn";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            tasks = tasks.filter(entry => entry.id !== task.id);
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");
        details.appendChild(title);
        details.appendChild(who);

        const actions = document.createElement("div");
        actions.className = "task-actions";
        actions.appendChild(status);
        actions.appendChild(remove);

        item.appendChild(details);
        item.appendChild(actions);
        list.appendChild(item);
    });
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        statusFilter = button.dataset.status;
        document.querySelectorAll(".filter-btn").forEach(entry => entry.classList.remove("active"));
        button.classList.add("active");
        renderTasks();
    });
});

document.getElementById("add-task-form").addEventListener("submit", event => {
    event.preventDefault();
    const titleInput = document.getElementById("task-title");
    const assigneeSelect = document.getElementById("task-assignee");
    const title = titleInput.value.trim();
    if (!title) {
        return;
    }

    const nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
    tasks.push({
        id: nextId,
        title,
        assigneeId: Number(assigneeSelect.value),
        status: "todo"
    });
    titleInput.value = "";
    saveTasks();
    renderTasks();
});

document.getElementById("test-git-btn").addEventListener("click", () => {
    document.getElementById("welcome").textContent = "Git change successfully applied!";
});

init();
