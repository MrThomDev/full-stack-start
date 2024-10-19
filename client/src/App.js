import styles from "./App.module.scss";

function App() {
  return (
    <div className={`${styles[`container`]}`}>
      <div className={`${styles[`primary`]}`}>Set your</div>
      <div className={`${styles[`secondary`]}`}>CSS variables</div>
      <div className={`${styles[`teritary`]}`}>In index.scss</div>
    </div>
  );
}

export default App;
