import React, {useState, useEffect} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from "axios";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1)
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp({history}) {
  const classes = useStyles();
  const [username , setusername] =useState("");
  const [password, setPassword] =useState("")
  const [confirmPassword, setConfirmPassword] =useState("");
  const [error, setError] = useState("");

  
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
        window.location.href = '/';
    }
  }, [history]);

  //error function
  const popError = (errorMessage) => {

    toast.error(errorMessage, {
      className :"error-toast",
      position:toast.POSITION.TOP_RIGHT
    });
  }

  //on handle
  const HandleSubmit = async (e) => {
    e.preventDefault();

    if(password.trim()!== confirmPassword.trim()){
      setError("*passwords should match");
      return;
    }
    else{
      setError("");
    }
   
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const { data } = await axios.post(
        "https://teams-clone-backend.herokuapp.com/user/register",
        { username, password},
        config
      );
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", username);
      window.location.href = '/';
    } catch (error) {
      popError(error.response.data.error);
      setError(error.response.data.error);
     
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };


  return (
    <Container component="main" maxWidth="xs">
    <>
      
      <ToastContainer
      draggable ={false}
      autoClose={3000}
      ></ToastContainer>

      </>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAe1BMVEX0QzZMr1AhlvP/wQf/////vgD0Nia63LtAq0Ww0vkAkfP/4636uLRJrk3/+Pj6saz2bWT1TEBVs1l0v3e027X4/Pn8zsv0PzLQ6NEsm/T/xBVWrPX/zUim0Pr/4qD3+//H4vz/7cPzJg8zqDj94N7h7+Hd6/z/8tsAjPI036d3AAABpElEQVR4nO3cSU5CURBA0fr4aBVFAcWGxt79r1CIEzFx+Ovlk3M3UDmppIYVpZTLq9l1tN3govxuOGra7ma+WO4nRSm3MbhrHVhB2ExHzeogvM3wVREejKsSl5ECrCNsps0yrgYpwErCZrSIWc4Kawmn82j/ilYVNjdJvnrChpCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ8F/hIKmXP8LXUVJxkdXbkfB9mFWUU4+w+xF2P8LuR9j9CLsfYfeLcVYfR3M/z7OKSVJf4yPheT+r6CU1+Ss8S4qQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkPBf4f2JCx/i8cSFT7GenLSwv4ltDrDaDpdRdjlLrCPsPx8+lu96GcYawv7Z889P9u36sf2Lmi98eNos95O+AYpCk2OCi44MAAAAAElFTkSuQmCC">
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={HandleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="username"
                variant="outlined"
                required
                value = {username}
                onChange ={(e) => setusername(e.target.value)}
                fullWidth
                id="username"
                label="Username"
                type="text"
                autoFocus
              />
            </Grid>
             {/* password */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                value = {password}
                onChange ={(e) => setPassword(e.target.value)}
                label="Password"
                type="password"
                id="password"
              />
            </Grid>
            {/* confirm password */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="confirmPassword"
                value = {confirmPassword}
                onChange ={(e) => setConfirmPassword(e.target.value)}
                label="Confirm Password"
                type="password"
                id="password"
              />
            </Grid>
            <Grid item xs={12}>
   <span style={{color:"red"}}>{error}</span>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}