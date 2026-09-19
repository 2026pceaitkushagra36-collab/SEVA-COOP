import { StatusPill } from "@/components/ui/status-pill";
import type { Tool } from "@/types/seva";

type ToolLibraryProps = {
  tools: Tool[];
};

export function ToolLibrary({ tools }: ToolLibraryProps) {
  return (
    <section className="section-block" id="tools">
      <div className="section-heading">
        <p className="eyebrow">Tool Library</p>
        <h2>Reserve the right tool from the nearest hub.</h2>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => (
          <article className="tool-card" key={tool.id}>
            <div className={`tool-visual bg-gradient-to-br ${tool.imageStyle}`}>
              <span>{tool.category.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="tool-card-body">
              <div className="tool-card-title">
                <div>
                  <p>{tool.category}</p>
                  <h3>{tool.name}</h3>
                </div>
                <StatusPill status={tool.status} />
              </div>
              <p className="muted">{tool.description}</p>
              <div className="tool-meta">
                <span>{tool.location}</span>
                <span>{tool.demandScore}% demand</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
