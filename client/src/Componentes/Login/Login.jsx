import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import style from "./Login.module.css";
import { useDispatch, useSelector } from "react-redux";
import GoogleLogin from "react-google-login";
import { addLoggedUser, getUserById } from "../../redux/actions/index";
import { useNavigate } from "react-router";
import { allUser } from "../../redux/actions/index";
import googleIcon from "../../Images/googleIcon.png";
import axios from "axios";

export function validation(validate) {
  let errors = {};

  // USUARIO-(EMAIL)

  if (!validate.email) {
    errors.email = "se requiere e-mail";
  } else if (
    !validate.email.match(
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    )
  ) {
    errors.email = "Ingrese un correo válido";
  }

  // PASSWORD (CONTRASEÑA ALFANUMERICO)

  if (!validate.password) {
    errors.password = "Se requiere contraseña";
  } else if (
    !validate.password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z])\S{5,15}/
    )
  ) {
    // errors.password = "se requiere clave alfanumerica";
  }

  return errors;
}

export default function Login() {
  const users = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [errors, setErrors] = React.useState({});

  const [validate, setValidate] = React.useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(allUser());
  }, [dispatch]);

  const handleInputChange = function(e) {
    setValidate({
      ...validate,
      [e.target.name]: e.target.value,
    });
    setErrors(
      validation({
        ...validate,
        [e.target.name]: e.target.value,
      })
    );
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

    if (validate.email !== "" && validate.password !== "") {
      const token = await axios.post(`/user/login`, validate);

      const usuario = users.find((user) => user.email === validate.email);
      if (
        token.data.user &&
        usuario.validated === "true" &&
        usuario.banned === "false"
      ) {
        dispatch(addLoggedUser(usuario.id));
        dispatch(getUserById(usuario.id));
        if (usuario.roles.filter((r) => r.tipo === "admin").length > 0)
          navigate(`/profile/${usuario.id}`);
        else navigate(`/profile/${usuario.id}`);
      } else {
        if (!token.data.user) alert("Email/password incorrecto");
        else if (usuario.validated !== "true") alert("Cuenta no verificada");
        else alert("Cuenta bloqueada");
      }
    } else {
      alert("Debes rellenar todos los campos antes de loguearte");
    }
  };

  const handleSucces = async (response) => {
    const userGoogle = users.find(
      (element) => element.email === response.profileObj.email
    );

    if (userGoogle !== undefined) {
      const token = await axios.post(`/user/login`, {
        email: userGoogle.email,
        password: userGoogle.password,
      });

      if (
        token.data.user &&
        userGoogle.validated === "true" &&
        userGoogle.banned === "false"
      ) {
        dispatch(addLoggedUser(userGoogle.id));
        dispatch(getUserById(userGoogle.id));
        navigate(`/profile/${userGoogle.id}`);
      } else {
        if (!token.data.user) alert("Email/password incorrecto");
        else if (userGoogle.validated !== "true") alert("Cuenta no verificada");
        else alert("Cuenta bloqueada");
      }
    } else {
      alert("No estas registrado, ahora seras redireccionado para registrarte");
      navigate(`/form`);
    }
  };

  const handleFailure = () => {};

  return (
    <div class={style.container}>
      <div className={style.logo}>
        <Link to="/home">
          <h1>AkademIT</h1>
        </Link>
      </div>
      <div className={style.title}>
        <h2>Iniciar Sesión</h2>
        <form class={style.form} onSubmit={(e) => handleOnSubmit(e)}>
          <div class={style.containerInput}>
            <div class={style.SubcontainerInput}>
              <br></br>
              <label>Correo electrónico</label>
              <input
                placeholder="Ingresa tu e-mail..."
                type="text"
                name="email"
                autoComplete="off"
                onChange={handleInputChange}
                value={validate.email}
              />
            </div>
            {errors.email && <p>{errors.email}</p>}

            <div class={style.SubcontainerInput}>
              <br></br>
              <label>Contraseña</label>
              <input
                placeholder="Ingresa tu Contraseña..."
                type="password"
                name="password"
                autoComplete="off"
                onChange={handleInputChange}
                value={validate.password}
              />
            </div>
            {errors.password && <p>{errors.password}</p>}
          </div>

          <div class={style.divButton2}>
            <button className={style.ingresar} type="submit">
              Ingresar
            </button>
            <GoogleLogin
              clientId="275221104976-ao35sbaekv1sb9d5g904v51k0uescmbf.apps.googleusercontent.com"
              render={(renderProps) => (
                <button
                  className={style.google}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  <img src={googleIcon} alt="" /> Ingresar con Google
                </button>
              )}
              onSuccess={handleSucces}
              onFailure={handleFailure}
              cookiePolicy={"single_host_origin"}
            />
          </div>
          <h4>¿No estas registrado?</h4>
          <div class={style.divButton1}>
            <Link to="/form">
              <button class={style.buttonRegistro} type="submit">
                Registrarme
              </button>
            </Link>
          </div>
          <Link to="/home">
            <button class={style.buttonReturnHome}>Volver</button>
          </Link>
        </form>
      </div>
    </div>
  );
}
