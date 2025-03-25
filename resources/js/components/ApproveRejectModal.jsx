const handleApprove = async () => {
    try {
        const response = await fetch(`/api/tasks/${taskId}/review-completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${yourAuthToken}`, // Adicione o token JWT
            },
            body: JSON.stringify({ status: 'concluida' }),
        });
        if (!response.ok) throw new Error('Erro ao aprovar');
        onApprove(); // Chama a função de sucesso
    } catch (error) {
        console.error(error);
    }
};

const handleReject = async (comment) => {
    try {
        const response = await fetch(`/api/tasks/${taskId}/review-completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${yourAuthToken}`, // Adicione o token JWT
            },
            body: JSON.stringify({ status: 'pendente', admin_comment: comment }),
        });
        if (!response.ok) throw new Error('Erro ao rejeitar');
        onReject(comment); // Chama a função de sucesso
    } catch (error) {
        console.error(error);
    }
};