import React, { useState } from 'react';

const RequestCompletionModal = ({ isOpen, onClose, onSubmit }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        onSubmit(comment);
        setComment('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Solicitar Conclusão da Tarefa</h2>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Adicione um comentário sobre a conclusão..."
                />
                <button onClick={handleSubmit}>Enviar Solicitação</button>
                <button onClick={onClose}>Cancelar</button>
            </div>
        </div>
    );
};

export default RequestCompletionModal;