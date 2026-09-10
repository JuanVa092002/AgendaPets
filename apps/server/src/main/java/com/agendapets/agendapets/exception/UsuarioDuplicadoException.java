package com.agendapets.agendapets.exception;

public class UsuarioDuplicadoException extends RuntimeException {

    public UsuarioDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
