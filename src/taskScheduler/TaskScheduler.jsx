import { createElement, useEffect, useMemo, useState } from "react";
import {
    FiArrowUp, FiCalendar, FiCheck, FiCheckCircle, FiCoffee, FiFacebook, FiFilter,
    FiGithub, FiGlobe, FiHeart, FiList, FiLinkedin, FiMail, FiMenu, FiPlus, FiStar,
    FiTrash2, FiYoutube,
} from "react-icons/fi";
import {
    Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper,
    Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import styles from "./styles.module.scss";

const STORAGE_KEY = "task-scheduler";
const socialLinks = [
    { label: "Portfolio", href: "https://www.ashishranjan.net/", icon: FiGlobe },
    { label: "GitHub", href: "https://github.com/a2rp", icon: FiGithub },
    { label: "CodePen", href: "https://codepen.io/ash1198", icon: FiStar },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aashishranjan", icon: FiLinkedin },
    { label: "Facebook", href: "https://www.facebook.com/theash.ashish/", icon: FiFacebook },
    { label: "YouTube", href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1", icon: FiYoutube },
    { label: "Email", href: "mailto:ash.ranjan09@gmail.com", icon: FiMail },
];
const supportLinks = [
    { label: "Support", href: "https://a2rp-donation-page.netlify.app/", icon: FiHeart },
    { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/a2rp", icon: FiCoffee },
    { label: "Patreon", href: "https://www.patreon.com/a2rp", icon: FiStar },
];
const filterOptions = [
    ["All Tasks", "All tasks"], ["Low Priority Tasks", "Low priority"],
    ["Medium Priority Tasks", "Medium priority"], ["High Priority Tasks", "High priority"],
    ["Completed Tasks", "Completed"], ["Available Tasks", "Available"],
];

function readTasks() {
    try {
        const savedTasks = window.localStorage.getItem(STORAGE_KEY);
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];
        return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
        return [];
    }
}

function getDateRange() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const week = new Date(today);
    week.setDate(today.getDate() + 7);
    return { tomorrow: tomorrow.toISOString().split("T")[0], week: week.toISOString().split("T")[0] };
}

function LinkGroup({ links }) {
    return <div className={styles.footerLinks} aria-label="External links">
        {links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
            aria-label={link.label} title={link.label}>{createElement(link.icon, { "aria-hidden": true })}</a>)}
    </div>;
}

const TaskScheduler = () => {
    const [tasks, setTasks] = useState(readTasks);
    const [taskName, setTaskName] = useState("");
    const [taskPriority, setTaskPriority] = useState("Low Priority");
    const [taskDate, setTaskDate] = useState("");
    const [taskSelect, setTaskSelect] = useState("All Tasks");
    const [isLoading, setIsLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTopButton, setShowTopButton] = useState(false);
    const { tomorrow, week } = useMemo(getDateRange, []);

    useEffect(() => setTaskDate(tomorrow), [tomorrow]);
    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);
    useEffect(() => {
        const handleScroll = () => setShowTopButton(window.scrollY > 320);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const visibleTasks = useMemo(() => {
        if (taskSelect === "All Tasks") return tasks;
        if (taskSelect === "Completed Tasks") return tasks.filter((task) => task.taskDone);
        if (taskSelect === "Available Tasks") return tasks.filter((task) => !task.taskDone);
        return tasks.filter((task) => task.taskPriority === taskSelect.replace(" Tasks", ""));
    }, [taskSelect, tasks]);
    const counts = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter((task) => task.taskDone).length,
        pending: tasks.filter((task) => !task.taskDone).length,
    }), [tasks]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const cleanName = taskName.trim();
        if (!cleanName) {
            toast.warn("Task name cannot be empty");
            return;
        }
        setIsLoading(true);
        window.setTimeout(() => {
            setTasks((currentTasks) => [...currentTasks, {
                id: uuidv4(), taskName: cleanName, taskPriority, taskDate, taskDone: false,
            }]);
            setTaskName("");
            setIsLoading(false);
            toast.success("Task added");
        }, 650);
    };

    const handleUpdateTask = (task) => {
        Swal.fire({
            title: "Mark this task as done?", text: task.taskName, icon: "question",
            showCancelButton: true, confirmButtonText: "Mark done", cancelButtonText: "Keep open",
            confirmButtonColor: "#167c67",
        }).then((result) => {
            if (!result.isConfirmed) return;
            setTasks((currentTasks) => currentTasks.map((item) => item.id === task.id ? { ...item, taskDone: true } : item));
            toast.success("Task marked as done");
        });
    };

    const handleDeleteTask = (task) => {
        Swal.fire({
            title: "Delete this task?", text: task.taskName, icon: "warning",
            showCancelButton: true, confirmButtonText: "Delete", cancelButtonText: "Keep task",
            confirmButtonColor: "#d84d4d",
        }).then((result) => {
            if (!result.isConfirmed) return;
            setTasks((currentTasks) => currentTasks.filter((item) => item.id !== task.id));
            toast.success("Task deleted");
        });
    };

    return <div className={styles.container}>
        <header className={styles.header}>
            <a className={styles.brand} href={process.env.PUBLIC_URL || "/"} aria-label="Task Scheduler home">
                <img src={process.env.PUBLIC_URL + "/logo.png"} alt="Ashish Ranjan logo" />
                <span><small>Productivity workspace</small><strong>Task Scheduler</strong></span>
            </a>
            <button className={styles.menuButton} type="button" onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen} aria-label="Toggle menu"><FiMenu aria-hidden="true" /></button>
            <nav className={styles.navigation + (menuOpen ? " " + styles.navigationOpen : "")}>
                <a href="#tasks" onClick={() => setMenuOpen(false)}><FiList aria-hidden="true" /> Tasks</a>
                <a href="https://github.com/a2rp/task-scheduler" target="_blank" rel="noopener noreferrer"><FiGithub aria-hidden="true" /> Source</a>
            </nav>
        </header>

        <main className={styles.main}>
            <section className={styles.hero}>
                <div><p className={styles.eyebrow}><FiCheckCircle aria-hidden="true" /> Plan with clarity</p>
                    <h1>A calmer way to organize your day.</h1>
                    <p className={styles.heroText}>Create tasks, set a priority and keep your next seven days visible in one focused workspace.</p>
                </div>
                <div className={styles.heroIcon}><FiCalendar aria-hidden="true" /></div>
            </section>

            <section className={styles.summaryGrid} aria-label="Task summary">
                <div className={styles.summaryCard}><FiList aria-hidden="true" /><span><strong>{counts.total}</strong><small>Total tasks</small></span></div>
                <div className={styles.summaryCard}><FiCheckCircle aria-hidden="true" /><span><strong>{counts.completed}</strong><small>Completed</small></span></div>
                <div className={styles.summaryCard}><FiFilter aria-hidden="true" /><span><strong>{counts.pending}</strong><small>Still open</small></span></div>
            </section>

            <section className={styles.formCard} aria-labelledby="create-task-title">
                <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Create a task</p><h2 id="create-task-title">What needs your attention?</h2></div><FiPlus aria-hidden="true" /></div>
                <form onSubmit={handleSubmit} className={styles.inputTaskContainer}>
                    <TextField value={taskName} onChange={(event) => setTaskName(event.target.value)} label="Task name" placeholder="e.g. Review project notes" fullWidth />
                    <FormControl fullWidth><InputLabel id="priority-select-label">Priority</InputLabel>
                        <Select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value)} labelId="priority-select-label" id="priority-select" label="Priority">
                            <MenuItem value="Low Priority">Low priority</MenuItem><MenuItem value="Medium Priority">Medium priority</MenuItem><MenuItem value="High Priority">High priority</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField value={taskDate} onChange={(event) => setTaskDate(event.target.value)} type="date" label="Due date" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: tomorrow, max: week }} />
                    <Button type="submit" variant="contained" disabled={isLoading} className={styles.submitButton}
                        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <FiPlus />}>{isLoading ? "Adding" : "Add task"}</Button>
                </form>
            </section>

            <section className={styles.taskListContainer} id="tasks" aria-labelledby="task-list-title">
                <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Your workspace</p><h2 id="task-list-title">Task list</h2></div>
                    <FormControl className={styles.tasksListSelect} size="small"><InputLabel id="tasks-select-label">View</InputLabel>
                        <Select value={taskSelect} onChange={(event) => setTaskSelect(event.target.value)} labelId="tasks-select-label" id="tasks-select" label="View">
                            {filterOptions.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </div>
                <TableContainer component={Paper} className={styles.tasksTable}>
                    <Table aria-label="Scheduled tasks"><TableHead><TableRow>
                        <TableCell>Task</TableCell><TableCell>Priority</TableCell><TableCell>Due date</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
                    </TableRow></TableHead><TableBody>
                        {visibleTasks.map((row) => <TableRow key={row.id} className={row.taskDone ? styles.completedRow : ""}>
                            <TableCell><div className={styles.taskName}><span>{row.taskName}</span><small>{row.id.slice(0, 8)}</small></div></TableCell>
                            <TableCell><span className={styles.priorityTag + " " + (row.taskPriority === "High Priority" ? styles.highPriority : row.taskPriority === "Medium Priority" ? styles.mediumPriority : styles.lowPriority)}>{row.taskPriority.replace(" Priority", "")}</span></TableCell>
                            <TableCell>{row.taskDate}</TableCell><TableCell><span className={styles.statusTag}>{row.taskDone ? "Completed" : "Open"}</span></TableCell>
                            <TableCell align="right"><Box className={styles.actions}>
                                <Button size="small" variant="outlined" onClick={() => handleUpdateTask(row)} disabled={row.taskDone} startIcon={<FiCheck />}>Done</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteTask(row)} startIcon={<FiTrash2 />}>Delete</Button>
                            </Box></TableCell>
                        </TableRow>)}
                        {visibleTasks.length === 0 && <TableRow><TableCell colSpan={5}><div className={styles.emptyState}><FiList aria-hidden="true" /><strong>No tasks in this view</strong><span>Add a task above to get started.</span></div></TableCell></TableRow>}
                    </TableBody></Table>
                </TableContainer>
            </section>
        </main>

        <footer className={styles.footer} id="footer">
            <div><p>Task Scheduler</p><small>Simple planning with local browser storage.</small></div>
            <div className={styles.footerRight}><div className={styles.footerGroups}><LinkGroup links={socialLinks} /><LinkGroup links={supportLinks} /></div>
                <p className={styles.copyright}>Copyright &copy; {new Date().getFullYear()} <a href="https://www.ashishranjan.net/" target="_blank" rel="noopener noreferrer">Ashish Ranjan</a></p>
            </div>
        </footer>
        {showTopButton && <button className={styles.topButton} type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top" title="Scroll to top"><FiArrowUp aria-hidden="true" /></button>}
        <div className={styles.backgroundShape} aria-hidden="true" />
    </div>;
};

export default TaskScheduler;
