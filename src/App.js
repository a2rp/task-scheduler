import React from 'react'
import TaskScheduler from './taskScheduler'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    return (
        <div>
            <TaskScheduler />

            <ToastContainer />
        </div>
    )
}

export default App

