import Home from './pages/HomePage';
import {
    Switch,
    Route
} from "react-router-dom";
import Layout from "./layout/Layout";

function App() {
    return (
        <Layout>
            <Switch>
                <Route path='/' exact>
                    <Home/>
                </Route>
            </Switch>
        </Layout>
    );
}

export default App;