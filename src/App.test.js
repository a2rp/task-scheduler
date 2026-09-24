import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the task scheduler", () => {
    render(<App />);
    expect(screen.getByText("Task Scheduler", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText(/what needs your attention/i)).toBeInTheDocument();
});
