class FragmentGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = []

    def add_node(self, fragment):
        self.nodes[fragment["id"]] = fragment

    def add_edge(self, source_id, target_id, score_data):
        self.edges.append({
            "source": source_id,
            "target": target_id,
            **score_data
        })
