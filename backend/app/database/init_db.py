from sqlalchemy.orm import Session
from app.database.session import engine, Base, SessionLocal
from app.models.domain import User, Course, Lesson, UserGoal
from app.utils.security import get_password_hash

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Create default demo user if not exists
        demo_user = db.query(User).filter(User.email == "student@example.com").first()
        if not demo_user:
            demo_user = User(
                email="student@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Mayuri Student",
                role="student"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Add sample goal
            goal = UserGoal(
                user_id=demo_user.id,
                title="Complete Machine Learning & AI Fundamentals",
                description="Score >85% in all AI quizzes and complete 1 lesson daily.",
                target_date="2026-08-30",
                is_completed=False
            )
            db.add(goal)
            db.commit()

        # Seed sample courses if empty
        if db.query(Course).count() == 0:
            c1 = Course(
                title="Machine Learning Fundamentals",
                description="Master supervised and unsupervised learning, regression, classification, and neural network basics.",
                category="Artificial Intelligence",
                level="Beginner",
                image_url="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&auto=format&fit=crop"
            )
            c2 = Course(
                title="Deep Learning & Neural Networks",
                description="Explore CNNs, RNNs, Backpropagation, PyTorch, and Computer Vision architectures.",
                category="Deep Learning",
                level="Intermediate",
                image_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop"
            )
            c3 = Course(
                title="LLM Architecture & Prompt Engineering",
                description="Understand Transformer models, self-attention, RAG systems, and Google Gemini API integration.",
                category="Generative AI",
                level="Advanced",
                image_url="https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop"
            )
            db.add_all([c1, c2, c3])
            db.commit()

            # Seed lessons
            l1 = Lesson(
                course_id=c1.id,
                title="Introduction to Machine Learning & Supervised Learning",
                content="Machine Learning is a subfield of artificial intelligence that focuses on building systems that learn from data. Supervised learning involves training models on labeled datasets to make predictions.",
                order_index=1,
                duration_mins=20
            )
            l2 = Lesson(
                course_id=c1.id,
                title="Linear Regression & Gradient Descent",
                content="Linear regression models the relationship between a scalar response and explanatory variables. Gradient descent is an optimization algorithm used to minimize the cost function.",
                order_index=2,
                duration_mins=25
            )
            l3 = Lesson(
                course_id=c2.id,
                title="Neural Network Foundations & Activation Functions",
                content="Artificial Neural Networks consist of interconnected nodes (neurons) organized in layers. Common activation functions include ReLU, Sigmoid, and Tanh.",
                order_index=1,
                duration_mins=30
            )
            db.add_all([l1, l2, l3])
            db.commit()
            print("Database initialized and sample data seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
