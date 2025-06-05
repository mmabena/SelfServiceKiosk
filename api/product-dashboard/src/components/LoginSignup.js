// import React, { useState } from "react";
// import "./LoginSignup.css"; // Import the CSS for styling

// const LoginSignup = () => {
//   const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup forms

//   return (
//     <div className="wrapper">
//       <div className="title-text">
//         <div
//           className={`title login ${isLogin ? "active" : ""}`}
//           onClick={() => setIsLogin(true)}
//         >
//           Login Form
//         </div>
//         <div
//           className={`title signup ${!isLogin ? "active" : ""}`}
//           onClick={() => setIsLogin(false)}
//         >
//           Signup Form
//         </div>
//       </div>
//       <div className="form-container">
//         <div className="slide-controls">
//           <input
//             type="radio"
//             name="slide"
//             id="login"
//             checked={isLogin}
//             onChange={() => setIsLogin(true)}
//           />
//           <input
//             type="radio"
//             name="slide"
//             id="signup"
//             checked={!isLogin}
//             onChange={() => setIsLogin(false)}
//           />
//           <label
//             htmlFor="login"
//             className={`slide login ${isLogin ? "active" : ""}`}
//           >
//             Login
//           </label>
//           <label
//             htmlFor="signup"
//             className={`slide signup ${!isLogin ? "active" : ""}`}
//           >
//             Signup
//           </label>
//           <div className="slider-tab"></div>
//         </div>
//         <div className="form-inner">
//           {/* Login Form */}
//           {isLogin ? (
//             <form action="#" className="login">
//               <div className="field">
//                 <input type="text" placeholder="Email Address" required />
//               </div>
//               <div className="field">
//                 <input type="password" placeholder="Password" required />
//               </div>
//               <div className="pass-link">
//                 <a href="#">Forgot password?</a>
//               </div>
//               <div className="field btn">
//                 <div className="btn-layer"></div>
//                 <input type="submit" value="Login" />
//               </div>
//               <div className="signup-link">
//                 Not a member?{" "}
//                 <a
//                   href=""
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setIsLogin(false);
//                   }}
//                 >
//                   Signup now
//                 </a>
//               </div>
//             </form>
//           ) : (
//             // Signup Form
//             <form action="#" className="signup">
//               <div className="field">
//                 <input type="text" placeholder="Username" required />
//               </div>
//               <div className="field">
//                 <input type="text" placeholder="First Name" required />
//               </div>
//               <div className="field">
//                 <input type="text" placeholder="Last Name" required />
//               </div>
//               <div className="field">
//                 <input type="email" placeholder="Email Address" required />
//               </div>
//               <div className="field">
//                 <input type="password" placeholder="Password" required />
//               </div>
//               <div className="field">
//                 <input
//                   type="password"
//                   placeholder="Confirm Password"
//                   required
//                 />
//               </div>
//               <div className="field">
//                 <select required>
//                   <option value="">Select User Role</option>
//                   <option value="user">User</option>
//                   <option value="superuser">Superuser</option>{" "}
//                   {/* Changed from admin to superuser */}
//                 </select>
//               </div>
//               <div className="field btn">
//                 <div className="btn-layer"></div>
//                 <input type="submit" value="Signup" />
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginSignup;
