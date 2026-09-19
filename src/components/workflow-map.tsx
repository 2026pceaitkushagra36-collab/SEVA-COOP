import { workflowSteps } from "@/config/workflow";

export function WorkflowMap() {
  return (
    <section className="section-block" id="workflow">
      <div className="section-heading">
        <p className="eyebrow">Build Workflow</p>
        <h2>From Supabase base to deployed cooperative platform.</h2>
      </div>
      <div className="workflow-list">
        {workflowSteps.map((step) => (
          <article className={`workflow-item ${step.status}`} key={step.id}>
            <span>{step.id}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
