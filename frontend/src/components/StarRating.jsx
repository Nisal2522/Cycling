const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex items-center">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readonly && onRatingChange(star)}
                    disabled={readonly}
                    className={`${
                        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    } transition-transform`}
                >
                    <span className={`text-2xl ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}>
                        ⭐
                    </span>
                </button>
            ))}
        </div>
    );
};

export default StarRating;
