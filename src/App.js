import TaskScheduler from "./taskScheduler";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => (
    <>
        <TaskScheduler />
        <ToastContainer position="bottom-right" autoClose={2400} />
    </>
);

export default App;
