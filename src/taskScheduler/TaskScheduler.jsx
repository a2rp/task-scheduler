import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

const TaskScheduler = () => {
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [taskPriority, setTaskPriority] = useState("Low Priority");
    const [taskDate, setTaskDate] = useState("");
    const [tomorrowDate, setTomorrowDate] = useState("");
    const [weekDate, setWeekDate] = useState("");
    const [taskSelect, setTaskSelect] = useState("All Tasks");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const allTasks = JSON.parse(window.localStorage.getItem("task-scheduler"));
        setTasks(allTasks);
        // console.log(allTasks, "all tasks");
    }, []);

    useEffect(() => {
        // console.log(taskSelect, "taskselect");
        const allTasks = JSON.parse(window.localStorage.getItem("task-scheduler"));
        setTasks(allTasks);

        if (taskSelect === "All Tasks") {
            const allTasks = JSON.parse(window.localStorage.getItem("task-scheduler"));
            setTasks(allTasks);
        } else if (taskSelect === "Low Priority Tasks") {
            const fetchedTasks = allTasks.filter(task => {
                if (task.taskPriority === "Low Priority") {
                    return task;
                }
                return null;
            });
            setTasks(fetchedTasks);
        } else if (taskSelect === "Medium Priority Tasks") {
            const fetchedTasks = allTasks.filter(task => {
                if (task.taskPriority === "Medium Priority") {
                    return task;
                }
                return null;
            });
            setTasks(fetchedTasks);
        } else if (taskSelect === "High Priority Tasks") {
            const fetchedTasks = allTasks.filter(task => {
                if (task.taskPriority === "High Priority") {
                    return task;
                }
                return null;
            });
            setTasks(fetchedTasks);
        } else if (taskSelect === "Completed Tasks") {
            const fetchedTasks = allTasks.filter(task => {
                if (task.taskDone === true) {
                    return task;
                }
                return null;
            });
            setTasks(fetchedTasks);
        } else if (taskSelect === "Available Tasks") {
            const fetchedTasks = allTasks.filter(task => {
                if (task.taskDone === false) {
                    return task;
                }
                return null;
            });
            setTasks(fetchedTasks);
        }
    }, [taskSelect]);

    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setTomorrowDate(tomorrow.toISOString().split("T")[0]);
        setTaskDate(tomorrow.toISOString().split("T")[0]);

        const week = new Date(today);
        week.setDate(week.getDate() + 7);
        setWeekDate(week.toISOString().split("T")[0]);
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        // console.log(taskName, taskPriority, taskDate);

        if (taskName.trim().length === 0) {
            return toast.warn("Task name can not be empty");
        }

        const data = { id: uuidv4(), taskName, taskPriority, taskDate, taskDone: false };
        setIsLoading(true);
        const timeout = setTimeout(() => {
            const oldTasks = JSON.parse(window.localStorage.getItem("task-scheduler")) || [];
            oldTasks.push(data);
            window.localStorage.setItem("task-scheduler", JSON.stringify(oldTasks));
            setTasks(oldTasks);
            setIsLoading(false);
        }, 1000 * 3);
    };

    const handleUpdateTask = (task) => {
        // console.log(task, "update");s
        Swal.fire({
            title: "Do you want to mark as done?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Yes",
            denyButtonText: `No`
        }).then((result) => {
            if (result.isConfirmed) {
                //   Swal.fire("Saved!", "", "success");
                const tasks = JSON.parse(window.localStorage.getItem("task-scheduler"));
                const updatedTasks = tasks.map(item => {
                    if (item.id === task.id) { item.taskDone = true }
                    return item;
                });
                window.localStorage.setItem("task-scheduler", JSON.stringify(updatedTasks));
            }
        });
    };

    const handleDeleteTask = (task) => {
        // console.log(task, "delete");
        Swal.fire({
            title: "Do you want to delete?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Delete",
            denyButtonText: `Don't delete`
        }).then((result) => {
            if (result.isConfirmed) {
                //   Swal.fire("Saved!", "", "success");
                const tasks = JSON.parse(window.localStorage.getItem("task-scheduler"));
                const updatedTasks = tasks.filter(item => {
                    if (item.id !== task.id) return item;
                    return null;
                });
                // console.log(updatedTasks, "updated");
                window.localStorage.setItem("task-scheduler", JSON.stringify(updatedTasks));
            }
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <div className={styles.heading}>Task Scheduler</div>

                <form onSubmit={handleSubmit} className={styles.inputTaskContainer}>
                    <TextField
                        value={taskName}
                        onChange={event => setTaskName(event.target.value)}
                        label="Write task here"
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel id="priority-select-label">Priority</InputLabel>
                        <Select
                            value={taskPriority}
                            onChange={event => setTaskPriority(event.target.value)}
                            labelId="priority-select-label"
                            id="priority-select"
                            label="Priority"
                        >
                            <MenuItem value={"Low Priority"}>Low Priority</MenuItem>
                            <MenuItem value={"Medium Priority"}>Medium Priority</MenuItem>
                            <MenuItem value={"High Priority"}>High Priority</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        value={taskDate}
                        onChange={event => setTaskDate(event.target.value)}
                        type="date"
                        fullWidth
                        InputProps={{ inputProps: { min: tomorrowDate, max: weekDate } }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        className={styles.submitButton}
                        sx={{ display: "flex" }}
                    >
                        {isLoading
                            ? <CircularProgress />
                            : "Submit"}
                    </Button>
                </form>

                <div className={styles.taskListContainer}>
                    <h3 className={styles.taskListHeading}>Task list</h3>
                    <FormControl className={styles.tasksListSelect}>
                        <InputLabel id="tasks-select-label">Select tasks</InputLabel>
                        <Select
                            value={taskSelect}
                            onChange={event => setTaskSelect(event.target.value)}
                            labelId="tasks-select-label"
                            id="tasks-select"
                            label="Priority"
                        >
                            <MenuItem value={"All Tasks"}>All tasks</MenuItem>
                            <MenuItem value={"Low Priority Tasks"}>Low Priority tasks</MenuItem>
                            <MenuItem value={"Medium Priority Tasks"}>Medium Priority Tasks</MenuItem>
                            <MenuItem value={"High Priority Tasks"}>High Priority Tasks</MenuItem>
                            <MenuItem value={"Completed Tasks"}>Completed Tasks</MenuItem>
                            <MenuItem value={"Available Tasks"}>Available Tasks</MenuItem>
                        </Select>
                    </FormControl>


                    <TableContainer component={Paper} className={styles.tasksTable}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#000" }}>
                                    <TableCell sx={{ color: "#fff" }}>Id</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Task name</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Task priority</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Task date</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks && tasks.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.taskName}</TableCell>
                                        <TableCell>{row.taskPriority}</TableCell>
                                        <TableCell>{row.taskDate}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: "15px" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleUpdateTask(row)}
                                                    disabled={row.taskDone}
                                                >Mark as dones</Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleDeleteTask(row)}
                                                >Delete task</Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </div>
            </div>
        </div>
    )
}

export default TaskScheduler

