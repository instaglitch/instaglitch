import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { filterCategories } from '../../filters';
import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';

export const FilterGallery: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const [category, setCategory] = useState(filterCategories[0].id);

  const currentCategory = useMemo(
    () => filterCategories.find(cat => cat.id === category),
    [category]
  );

  return (
    <Modal
      title="Filter gallery"
      onDismiss={() => (projectStore.modal = undefined)}
    >
      <div className="filter-gallery">
        <div className="categories">
          {filterCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={category === cat.id ? 'selected' : ''}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div>
          <div className="filters">
            {currentCategory?.filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => projectStore.addFilter(filter)}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
});
