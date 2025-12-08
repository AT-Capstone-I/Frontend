import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X, Clock, MapPin } from 'lucide-react';

const PlaceList = ({ places, onRemovePlace, onReorder, routeLegs }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <div className="places-list">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="places">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {places.map((place, index) => (
                <React.Fragment key={place.id}>
                  {/* Show route info before the item if it's not the first one */}
                  {index > 0 && routeLegs[index - 1] && (
                    <div className="route-info">
                      <div className="route-line"></div>
                      <Clock size={14} />
                      <span>{routeLegs[index - 1].duration.text}</span>
                      <span style={{ color: 'var(--text-secondary)', margin: '0 4px' }}>•</span>
                      <span>{routeLegs[index - 1].distance.text}</span>
                    </div>
                  )}

                  <Draggable draggableId={place.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`place-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div {...provided.dragHandleProps} className="drag-handle">
                          <GripVertical size={20} />
                        </div>
                        <div className="place-info">
                          <div className="place-name">{place.name}</div>
                          <div className="place-address">{place.address}</div>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => onRemovePlace(place.id)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {places.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
          <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Search and add places to plan your route</p>
        </div>
      )}
    </div>
  );
};

export default PlaceList;
