
# Gerenciador de Tarefas

Sistema completo para gerenciamento de tarefas com autenticação JWT, permissões de usuário, notificações por e-mail e painel administrativo com gráficos interativos.

## 📌 Funcionalidades

- Autenticação JWT (login, registro, logout)
- Papéis de usuário (comum e administrador)
- CRUD de tarefas com validações
- Solicitação de conclusão de tarefas com aprovação ou recusa (com justificativa)
- Envio de notificações por e-mail:
  - Tarefa vencendo
  - Tarefa alterada pelo admin
  - Criação/edição/exclusão de tarefa
  - Resultado da solicitação de conclusão
- Painel admin com estatísticas e filtros (tarefas pendentes, concluídas, vencidas)
- Integração com APIs externas:
  - Feriados nacionais (BrasilAPI)
  - Previsão do tempo (OpenWeatherMap)
- Gráficos interativos (com filtros)
- Exportação de relatórios em PDF
- Recuperação de senha por e-mail

## 🧰 Tecnologias Utilizadas

### 🔙 Back-end (Laravel)
- Laravel 10
- PHP 8+
- MySQL
- JWT Auth
- Mailtrap (para e-mails em dev)
- PHPUnit
- Laravel Scheduler
- Swagger (documentação da API)

### 🔜 Front-end (React + Vite)
- React
- Axios
- React Router
- TailwindCSS
- Recharts

## 🔐 Segurança

- **JWT** (Autenticação via JSON Web Token)
- **CORS** (Cross-Origin Resource Sharing)
- **Rate Limiting** (Limitação de requisições)

## ⚙️ Como rodar o projeto

### 📦 Backend (Laravel)

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/gerenciador-de-tarefas.git
cd gerenciador-de-tarefas/backend

# Instale as dependências
composer install

# Copie o .env e configure
cp .env.example .env
php artisan key:generate

# Configure o banco de dados no .env e rode as migrations
php artisan migrate

# Inicie o servidor
php artisan serve
```

### 💻 Frontend (React)

```bash
cd ../frontend

# Instale as dependências
npm install

# Rode a aplicação
npm run dev
```

> ⚠️ Certifique-se de que o backend está rodando e acessível via CORS.

## 🧪 Testes

```bash
# No diretório backend
php artisan test
```

## 📝 Documentação da API

Acesse `/api/documentation` após subir o Laravel para ver a documentação gerada via Swagger.

## 🙋‍♂️ Autor

**Leonardo Zene Neves**  
📧 leonardozene.neves@gmail.com  
🌍 [LinkedIn](https://www.linkedin.com/in/leonardozeneneves)  
🐙 [GitHub](https://github.com/leo2033)

## 📄 Licença

Este projeto está licenciado sob a MIT License.  
