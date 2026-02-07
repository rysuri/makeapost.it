import { Link } from "react-router-dom";
function Operations() {
  return (
    <>
      <div>
        <h1>Operations Page</h1>
        <Link to="/operations/add">Make a post</Link>
      </div>
    </>
  );
}

export default Operations;
