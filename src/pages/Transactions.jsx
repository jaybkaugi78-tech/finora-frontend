import { Filter, Plus, Search } from "lucide-react";
import TransactionList from "../components/TransactionList";
import { transactions } from "../data/mockData";
export default function Transactions() {
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">Money movement</span>
          <h1>Transactions</h1>
          <p>Track every shilling coming in and going out.</p>
        </div>
        <button className="primary">
          <Plus size={18} />
          Add transaction
        </button>
      </section>
      <section className="panel">
        <div className="toolbar">
          <div className="toolbar-search">
            <Search size={17} />
            <input placeholder="Search transactions..." />
          </div>
          <button className="secondary">
            <Filter size={17} />
            Filters
          </button>
        </div>
        <TransactionList items={transactions} />
      </section>
    </div>
  );
}
