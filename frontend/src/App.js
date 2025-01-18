import logo from './logo.svg';
import './App.css';
import DataFetcher from './DataFetcher';
import InteractiveUMAP from './InteractiveUMAP';
import DragUploadSection from './DragUploadSection';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
function App() {
  return (
    <div className="App">
      {/* <h1>React App Connected to Flask Backend</h1> */}
      <InteractiveUMAP/>
      {/* <DragUploadSection/> */}
    </div>
  );
}

export default App;
