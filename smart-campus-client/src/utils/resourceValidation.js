export function validateResourceForm(form) {
  const errors = {};

  if (!form.name || form.name.trim() === '') {
    errors.name = 'Resource name is required';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (form.name.trim().length > 100) {
    errors.name = 'Name cannot exceed 100 characters';
  }

  if (!form.type) {
    errors.type = 'Resource type is required';
  }

  if (!form.location || form.location.trim() === '') {
    errors.location = 'Location is required';
  } else if (form.location.trim().length < 2) {
    errors.location = 'Location must be at least 2 characters';
  } else if (form.location.trim().length > 150) {
    errors.location = 'Location cannot exceed 150 characters';
  }

  if (form.capacity !== '' && form.capacity !== null && form.capacity !== undefined) {
    const cap = Number(form.capacity);
    if (isNaN(cap) || !Number.isInteger(cap)) {
      errors.capacity = 'Capacity must be a whole number';
    } else if (cap < 1) {
      errors.capacity = 'Capacity must be at least 1';
    } else if (cap > 5000) {
      errors.capacity = 'Capacity cannot exceed 5000';
    }
  }

  if (form.description && form.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  if (form.availabilityWindows && form.availabilityWindows.length > 0) {
    form.availabilityWindows.forEach((w, i) => {
      if (w.openTime && w.closeTime && w.openTime >= w.closeTime) {
        errors[`window_${i}`] = `${w.day}: Close time must be after open time`;
      }
    });
  }

  return errors;
}

export function validateSearchFilters(filters) {
  const errors = {};

  if (filters.minCapacity !== '' && filters.minCapacity !== undefined) {
    const cap = Number(filters.minCapacity);
    if (isNaN(cap)) {
      errors.minCapacity = 'Must be a number';
    } else if (cap < 1) {
      errors.minCapacity = 'Must be at least 1';
    } else if (cap > 5000) {
      errors.minCapacity = 'Cannot exceed 5000';
    }
  }

  if (filters.search && filters.search.length > 100) {
    errors.search = 'Search term cannot exceed 100 characters';
  }

  return errors;
}