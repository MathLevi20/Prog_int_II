import { NextFunction, Request, Response } from "express";

export function AuthMiddleware(request: Request, 
    response: Response, next: NextFunction){

        const auth = request.headers.authorization

        if (!auth){
            return response.status(401).json('Crendenciais inválidas!')
        }

        const [authType, authValue] = auth.split(' ')

        if (authType === 'Basic'){
            // decodificar user:senha
            // veriicar no banco de dados se usuario e senha estao ok
            // liberar o não a requisicão
            // let data = 'c3RhY2thYnVzZS5jb20=';
            let buff = Buffer.from(authValue, 'base64');
            let [email, senha] = buff.toString('ascii').split(':');
            console.log(email, senha)
            
        }


        if (authType === 'Bearer'){
            // Validar o Token para liberar ou não a requisição
        }

        console.log(`Auth Middleware 👀 -> ${authType}->${authValue}`)
        
        return next()
}