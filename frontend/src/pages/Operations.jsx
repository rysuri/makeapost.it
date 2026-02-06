import { Link } from "react-router-dom";
function Operations() {
  return (
    <>
      <div>
        <Link to="/">Home Page</Link>
        <h1>Operations Page</h1>

        <Link to="/operations/add">Add Page</Link>
      </div>
    </>
  );
}

export default Operations;
