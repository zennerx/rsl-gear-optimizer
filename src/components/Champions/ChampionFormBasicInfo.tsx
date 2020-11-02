import React, { useMemo } from "react";
import { ChampionDraft, ChampionSetMethod } from "models/Champion";
import Sets, { SortedExistingSets } from "models/Sets";
import Stack from "components/UI/FlexStack";
import Error from "models/Error";
import SetDisplay from "components/UI/SetDisplay";
import Grid from "components/UI/Grid";

import DropdownSelect, {
  DropdownSelectItem,
} from "components/UI/DropdownSelect";
import ChampionsList from "models/ChampionsList";

import { useLanguage } from "lang/LanguageContext";
import { Language } from "lang/language";
import RadioButtons from "components/UI/RadioButtons";
import DisplayError from "components/UI/DisplayError";
import Toggle from "components/UI/Toggle";

export interface ChampionFormBasicInfoProps {
  state: ChampionDraft;
  setState: React.Dispatch<React.SetStateAction<ChampionDraft>>;
  errors: Error;
}

type SetsString = keyof typeof Sets;

export default ({
  state,
  setState,
  errors,
}: ChampionFormBasicInfoProps): JSX.Element => {
  const updateChampion = (champion: DropdownSelectItem) => {
    setState((current) => ({ ...current, champion: champion.value }));
  };

  const lang = useLanguage();

  const selectList = useMemo(
    () =>
      ChampionsList.map((c) => ({
        value: c,
        text: lang[`champion${c}` as keyof Language],
      })),
    [lang]
  );

  const updateSets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const setKey = event?.target?.value;

    if (setKey) {
      const set = Sets[setKey as SetsString];

      setState((current) => {
        let newSets = current.sets;
        if (current.sets.includes(set)) {
          newSets = current.sets.filter((s) => s !== set);
        } else {
          newSets = [...current.sets, set].sort();
        }

        return { ...current, sets: newSets };
      });
    }
  };

  const updateMethod = (methods: ChampionSetMethod) => {
    setState((current) => ({ ...current, methods }));
  };

  const toggleChampion = () => {
    setState((current) => ({ ...current, activated: !current.activated }));
  };

  return (
    <Stack>
      <DisplayError slot="champion" errors={errors} />
      <div className="form-group row">
        <label htmlFor="inputName" className="col-sm-2 col-form-label">
          {lang.titleChampion}
        </label>
        <div className="col-sm-10">
          <DropdownSelect
            items={selectList}
            value={state.champion}
            onChange={updateChampion}
          />
        </div>
      </div>
      <fieldset className="form-group">
        <div className="row">
          <legend className="col-form-label col-sm-2 pt-0">
            {lang.titleIsActivated}
          </legend>
          <div className="col-sm-10">
            <Toggle
              currentState={state.activated}
              name="toggleChampion"
              onToggle={toggleChampion}
            />
          </div>
        </div>
      </fieldset>
      <DisplayError slot="methods" errors={errors} />
      <fieldset className="form-group">
        <div className="row">
          <legend className="col-form-label col-sm-2 pt-0">
            {lang.titleMethod}
          </legend>
          <div className="col-sm-10">
            <RadioButtons
              inline
              name="methodRadio"
              selectedOption={state.methods}
              options={[
                {
                  text: lang.optionMethodRequiredSet,
                  value: ChampionSetMethod.RequireSets,
                },
                {
                  text: lang.optionMethodOptionalSets,
                  value: ChampionSetMethod.OptionalSets,
                },
                {
                  text: lang.optionMethodNoSets,
                  value: ChampionSetMethod.NoSets,
                },
              ]}
              onChange={updateMethod}
            />
          </div>
        </div>
      </fieldset>
      <DisplayError slot="sets" errors={errors} />
      <Grid columns={4}>
        {SortedExistingSets.map((set) => {
          const label = (
            <>
              {lang[`set${set}` as keyof Language]}{" "}
              <SetDisplay set={set} size={10} />
            </>
          );

          return (
            <div
              key={`sets-${set}`}
              className="form-check custom-control custom-checkbox custom-control-inline"
            >
              <input
                className="custom-control-input"
                type="checkbox"
                id={`sets-${set}`}
                checked={state.sets.includes(set)}
                disabled={state.methods === ChampionSetMethod.NoSets}
                onChange={updateSets}
                value={set}
              />
              <label className="custom-control-label" htmlFor={`sets-${set}`}>
                {label}
              </label>
            </div>
          );
        })}
      </Grid>
    </Stack>
  );
};