import { defineComponent, ref, computed, toRefs, inject } from 'vue';

import props from './option-props';
import Checkbox, { CheckboxProps } from '../checkbox/index';

// hooks
import { useFormDisabled } from '../form/hooks';
import useRipple from '../hooks/useRipple';
import { useContent } from '../hooks/tnode';
import { usePrefixClass, useCommonClassName } from '../hooks/useConfig';
import { selectInjectKey } from './constants';
import { SelectValue } from './type';

export default defineComponent({
  name: 'TOption',

  props: { ...props },
  setup(props) {
    const tSelect = inject(selectInjectKey);

    const formDisabled = useFormDisabled();

    const disabled = computed(() => {
      if (tSelect.value.multiple) {
        return tSelect.value.max <= (tSelect.value.selectValue as SelectValue[]).length;
      }
      return formDisabled.value;
    });

    const renderContent = useContent();

    const selectName = usePrefixClass('select');
    const { STATUS, SIZE } = useCommonClassName();
    const liRef = ref<HTMLElement>();

    const isHover = ref(false);

    const isSelected = computed(() => {
      return !tSelect.value.multiple
        ? tSelect.value.selectValue === props.value
        : (tSelect.value.selectValue as SelectValue[]).includes(props.value);
    });

    const classes = computed(() => [
      `${selectName.value}-option`,
      [SIZE.value[tSelect.value.size]],
      {
        [STATUS.value.disabled]: disabled.value,
        [STATUS.value.selected]: isSelected.value,
        [`${selectName.value}-option__hover`]: isHover.value && !disabled.value && !isSelected.value,
      },
    ]);

    const labelText = computed(() => props.label || props.value);

    const handleClick = (e: MouseEvent | KeyboardEvent) => {
      if (tSelect.value.multiple) return;
      e.stopPropagation();

      tSelect.value.onChange(props.value, { e, trigger: 'check' });
      tSelect.value.onPopupVisibleChange(false, { e });
    };

    const handleCheckboxClick = (val: boolean, context: { e: MouseEvent | KeyboardEvent }) => {
      const valueIndex = (tSelect.value.selectValue as SelectValue[]).indexOf(props.value);
      if (valueIndex < 0) {
        (tSelect.value.selectValue as SelectValue[]).push(props.value);
      } else {
        (tSelect.value.selectValue as SelectValue[]).splice(valueIndex, 1);
      }
      tSelect.value.onChange(tSelect.value.selectValue, { e: context.e, trigger: val ? 'check' : 'uncheck' });
    };

    useRipple(liRef);

    return () => {
      const optionChild = renderContent('default', 'content') || labelText.value;
      return (
        <li
          ref="liRef"
          class={classes.value}
          title={`${labelText.value}`}
          onMouseenter={() => (isHover.value = true)}
          onMouseleave={() => (isHover.value = false)}
          onClick={handleClick}
        >
          {tSelect && tSelect.value.multiple ? (
            <Checkbox
              checked={isSelected.value}
              disabled={disabled.value && !isSelected.value}
              onChange={handleCheckboxClick}
            >
              {optionChild}
            </Checkbox>
          ) : (
            <span>{optionChild}</span>
          )}
        </li>
      );
    };
  },
});
