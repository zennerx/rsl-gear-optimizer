import Stack from "components/UI/Stack";
import Modal from "components/UI/Modal";

import { RarityFromString, RarityString, Stars } from "models/Quality";

import { State } from "redux/reducers";

import { validateArtifact } from "components/Artifacts/ArtifactForm";
import { loadArtifacts } from "redux/artifactsSlice";
import { loadChampions } from "redux/championsSlice";
import { useLanguage } from "lang/LanguageContext";
import {
  AccessoriesSlots,
  Artifact,
  ArtifactDraft,
  ChampionDraft,
  ChampionSetMethod,
  ChampionsList,
  Clans,
  ExistingClans,
  ExistingSets,
  ExistingSlots,
  ExistingSlotsAccessories,
  ExistingStats,
  Sets,
  Slots,
  Stat,
  StatsFull,
} from "models";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import React, { ChangeEvent, useState } from "react";
import Button from "react-bootstrap/Button";

const Textarea = styled.textarea.attrs(() => ({ className: "form-control" }))`
  flex: 1;
`;

const exportCSV = (rows: string[][], filename: string) => {
  const csvContent = rows.map((e) => e.join(";")).join("\n");
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);

  link.click();
};

const importChampions = (value: string[]): ChampionDraft[] | false => {
  try {
    const rows = value.slice(1);
    const champions: ChampionDraft[] = [];
    rows.forEach((row) => {
      const fields = row.split(";");
      if (fields.length < 18) {
        throw Error(String(fields.length));
      }

      const champion = fields[0];
      const order = parseInt(fields[1], 10);
      const methods = parseInt(fields[2], 10);

      const sets = fields[3]
        .split(",")
        .filter((s) => s)
        .sort() as Sets[];

      const [
        statsPriorityAcc,
        statsPriorityAtkp,
        statsPriorityAtk,
        statsPriorityCdmg,
        statsPriorityCrate,
        statsPriorityDefp,
        statsPriorityDef,
        statsPriorityHpp,
        statsPriorityHp,
        statsPriorityResi,
        statsPrioritySpd,
      ] = fields.slice(4, 15).map((s) => parseInt(s, 10));

      const [gauntletStats, chestplateStats, bootsStats] = fields
        .slice(15)
        .map((s) => s.split(",").sort() as Stat[]);

      const accessories = (fields[18] ?? "") as AccessoriesSlots | "";

      if (!ChampionsList.includes(champion)) {
        throw Error(champion);
      }

      if (typeof order !== "number") {
        throw Error(order);
      }

      if (order < 0 || Number.isNaN(order)) {
        throw Error(String(order));
      }

      const existingOrder = champions.find((c) => c.order === order);
      if (existingOrder) {
        throw Error(String(order));
      }

      if (typeof methods !== "number") {
        throw Error(methods);
      }

      if (methods < 0 || methods > 2) {
        throw Error(String(methods));
      }

      if (methods === ChampionSetMethod.NoSets && sets.length !== 0) {
        throw Error(String(sets.length));
      }

      const invalidSets = sets.filter((s) => !ExistingSets.includes(s));
      if (invalidSets.length !== 0) {
        throw Error(String(invalidSets.join(",")));
      }

      if (statsPriorityAtkp < 0 || statsPriorityAtkp > 3) {
        throw Error(String(statsPriorityAtkp));
      }
      if (statsPriorityCdmg < 0 || statsPriorityCdmg > 3) {
        throw Error(String(statsPriorityCdmg));
      }
      if (statsPriorityCrate < 0 || statsPriorityCrate > 3) {
        throw Error(String(statsPriorityCrate));
      }
      if (statsPriorityDefp < 0 || statsPriorityDefp > 3) {
        throw Error(String(statsPriorityDefp));
      }
      if (statsPriorityHpp < 0 || statsPriorityHpp > 3) {
        throw Error(String(statsPriorityHpp));
      }
      if (statsPriorityAcc < 0 || statsPriorityAcc > 3) {
        throw Error(String(statsPriorityAcc));
      }
      if (statsPriorityAtk < 0 || statsPriorityAtk > 3) {
        throw Error(String(statsPriorityAtk));
      }
      if (statsPriorityDef < 0 || statsPriorityDef > 3) {
        throw Error(String(statsPriorityDef));
      }
      if (statsPriorityHp < 0 || statsPriorityHp > 3) {
        throw Error(String(statsPriorityHp));
      }
      if (statsPriorityResi < 0 || statsPriorityResi > 3) {
        throw Error(String(statsPriorityResi));
      }
      if (statsPrioritySpd < 0 || statsPrioritySpd > 3) {
        throw Error(String(statsPrioritySpd));
      }

      if (gauntletStats.length === 0) {
        throw Error(String(gauntletStats.length));
      }
      if (chestplateStats.length === 0) {
        throw Error(String(chestplateStats.length));
      }
      if (bootsStats.length === 0) {
        throw Error(String(bootsStats.length));
      }

      const invalidGauntletsStats = gauntletStats.filter(
        (s) => !ExistingStats.includes(s)
      );
      const invalidChestplateStats = chestplateStats.filter(
        (s) => !ExistingStats.includes(s)
      );
      const invalidBootsStats = bootsStats.filter(
        (s) => !ExistingStats.includes(s)
      );

      if (invalidGauntletsStats.length !== 0) {
        throw Error(String(invalidGauntletsStats.join(",")));
      }
      if (invalidChestplateStats.length !== 0) {
        throw Error(String(invalidChestplateStats.join(",")));
      }
      if (invalidBootsStats.length !== 0) {
        throw Error(String(invalidBootsStats.join(",")));
      }

      if (
        accessories !== "" &&
        !ExistingSlotsAccessories.includes(accessories)
      ) {
        throw Error(accessories);
      }

      const newChampion: ChampionDraft = {
        Champion: champion,
        order,
        Methods: methods,
        Sets: sets,
        StatsPriority: {
          "ATK%": statsPriorityAtkp,
          "C.DMG": statsPriorityCdmg,
          "C.RATE": statsPriorityCrate,
          "DEF%": statsPriorityDefp,
          "HP%": statsPriorityHpp,
          ACC: statsPriorityAcc,
          ATK: statsPriorityAtk,
          DEF: statsPriorityDef,
          HP: statsPriorityHp,
          RESI: statsPriorityResi,
          SPD: statsPrioritySpd,
        },
        BootsStats: bootsStats,
        ChestplateStats: chestplateStats,
        GauntletStats: gauntletStats,
        Activated: true,
        Accessories: accessories,
      };

      champions.push(newChampion);
    });
    return champions;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return false;
  }
};

const importArtifact = (value: string[]): ArtifactDraft[] | false => {
  try {
    const rows = value.slice(1);
    const artifacts: ArtifactDraft[] = [];

    rows.forEach((row) => {
      const fields = row.split(";");
      if (fields.length !== 24) {
        throw Error(String(fields.length));
      }

      const Slot = fields[0] as Slots;
      const SetOrClan = fields[1] as Sets;
      const Quality = parseInt(fields[2], 10) as Stars;
      const RarityStr = fields[3];
      const Level = parseInt(fields[4], 10);
      const Champion = fields[5];

      const MainStats = fields[6] as Stat;
      const MainStatsValue = parseInt(fields[7], 10);

      const SubStats: [StatsFull?, StatsFull?, StatsFull?, StatsFull?] = [];

      const Set = ExistingSets.includes(SetOrClan) ? SetOrClan : Sets.Null;
      const Clan = ExistingClans.includes((SetOrClan as unknown) as Clans)
        ? ((SetOrClan as unknown) as Clans)
        : Clans.Null;

      const subStat1 = fields[8] as Stat;
      const subValue1 = parseInt(fields[9], 10);
      const subRolls1 = parseInt(fields[10], 10);
      const subRune1 = parseInt(fields[11], 10);
      if (subStat1) {
        SubStats.push({
          Stats: subStat1,
          Value: subValue1,
          Roll: Number.isNaN(subRolls1) ? 0 : subRolls1,
          Rune: Number.isNaN(subRune1) ? 0 : subRune1,
        });
      }

      const subStat2 = fields[12] as Stat;
      const subValue2 = parseInt(fields[13], 10);
      const subRolls2 = parseInt(fields[14], 10);
      const subRune2 = parseInt(fields[15], 10);
      if (subStat2) {
        SubStats.push({
          Stats: subStat2,
          Value: subValue2,
          Roll: Number.isNaN(subRolls2) ? 0 : subRolls2,
          Rune: Number.isNaN(subRune2) ? 0 : subRune2,
        });
      }

      const subStat3 = fields[16] as Stat;
      const subValue3 = parseInt(fields[17], 10);
      const subRolls3 = parseInt(fields[18], 10);
      const subRune3 = parseInt(fields[19], 10);
      if (subStat3) {
        SubStats.push({
          Stats: subStat3,
          Value: subValue3,
          Roll: Number.isNaN(subRolls3) ? 0 : subRolls3,
          Rune: Number.isNaN(subRune3) ? 0 : subRune3,
        });
      }

      const subStat4 = fields[20] as Stat;
      const subValue4 = parseInt(fields[21], 10);
      const subRolls4 = parseInt(fields[22], 10);
      const subRune4 = parseInt(fields[23], 10);
      if (subStat4) {
        SubStats.push({
          Stats: subStat4,
          Value: subValue4,
          Roll: Number.isNaN(subRolls4) ? 0 : subRolls4,
          Rune: Number.isNaN(subRune4) ? 0 : subRune4,
        });
      }

      if (!ExistingSlots.includes(Slot)) {
        throw Error(Slot);
      }

      if (Set === "" && Clan === "") {
        throw Error(Set);
      }

      if (Clan === "" && !ExistingSets.includes(Set)) {
        throw Error(Set);
      }

      if (Set === "" && !ExistingClans.includes(Clan)) {
        throw Error(Clan);
      }

      if (Quality < 1 || Quality > 6) {
        throw Error(String(Quality));
      }

      if (!Object.values(RarityString).includes(RarityStr)) {
        throw Error(RarityStr);
      }

      if (Level < 0 || Level > 16) {
        throw Error(String(Level));
      }

      if (Champion !== "" && !ChampionsList.includes(Champion)) {
        throw Error(Champion);
      }

      if (!ExistingStats.includes(MainStats)) {
        throw Error(MainStats);
      }

      if (MainStatsValue <= 0) {
        throw Error(String(MainStatsValue));
      }

      SubStats.forEach((sub) => {
        if (sub && !ExistingStats.includes(sub.Stats)) {
          throw Error(JSON.stringify(sub));
        }
      });

      const newArtifact: ArtifactDraft = {
        Slot,
        Set,
        Clan,
        isAccessory: Clan !== Clans.Null,
        Quality,
        Rarity: RarityFromString[RarityStr],
        Level,
        Champion,
        MainStats,
        MainStatsValue,
        SubStats,
      };

      validateArtifact(newArtifact as Artifact, (errors) => {
        if (errors.length > 0) {
          throw Error(JSON.stringify({ row, errors }));
        }
      });

      artifacts.push(newArtifact);
    });
    return artifacts;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return false;
  }
};

export default (): JSX.Element => {
  const champions = useSelector((state: State) => state.champions);
  const artifacts = useSelector((state: State) => state.artifacts);
  const lang = useLanguage();

  const [showModalImport, setShow] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const dispatch = useDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const onImport = () => {
    const rows = textareaValue.trim().replace("\r", "").split("\n");

    const separator = rows.findIndex((r) => r === "---");

    const rowsChampions = rows.slice(1, separator);
    const rowsArtifacts = rows.slice(separator + 1);

    const listArtifacts = importArtifact(rowsArtifacts);
    if (listArtifacts) {
      dispatch(loadArtifacts({ artifacts: listArtifacts }));
    }

    const listChampions = importChampions(rowsChampions);
    if (listChampions) {
      dispatch(loadChampions({ champions: listChampions }));
    }

    handleClose();
  };

  const exportChampions = () => {
    const rows = champions.map((champion) => {
      return [
        champion.Champion,
        champion.order,
        champion.Methods,
        champion.Sets.join(","),
        champion.StatsPriority.ACC ?? "0",
        champion.StatsPriority["ATK%"] ?? "0",
        champion.StatsPriority.ATK ?? "0",
        champion.StatsPriority["C.DMG"] ?? "0",
        champion.StatsPriority["C.RATE"] ?? "0",
        champion.StatsPriority["DEF%"] ?? "0",
        champion.StatsPriority.DEF ?? "0",
        champion.StatsPriority["HP%"] ?? "0",
        champion.StatsPriority.HP ?? "0",
        champion.StatsPriority.RESI ?? "0",
        champion.StatsPriority.SPD ?? "0",
        champion.GauntletStats.join(","),
        champion.ChestplateStats.join(","),
        champion.BootsStats.join(","),
        champion.Accessories,
      ].map((v) => (v !== undefined ? String(v) : ""));
    });

    const header = [
      "champion",
      "order",
      "methods",
      "sets",
      "stats_priority_acc",
      "stats_priority_atkp",
      "stats_priority_atk",
      "stats_priority_cdmg",
      "stats_priority_crate",
      "stats_priority_defp",
      "stats_priority_def",
      "stats_priority_hpp",
      "stats_priority_hp",
      "stats_priority_resi",
      "stats_priority_spd",
      "gauntlet_stats",
      "chestplate_stats",
      "boots_stats",
    ];

    return [header, ...rows];
  };

  const exportArtifacts = () => {
    const rows = artifacts.map((artifact) => {
      return [
        artifact.Slot,
        artifact.isAccessory ? artifact.Clan : artifact.Set,
        artifact.Quality,
        RarityString[artifact.Rarity],
        artifact.Level,
        artifact.Champion,
        artifact.MainStats,
        artifact.MainStatsValue,
        artifact.SubStats[0]?.Stats,
        artifact.SubStats[0]?.Value,
        artifact.SubStats[0]?.Roll,
        artifact.SubStats[0]?.Rune,
        artifact.SubStats[1]?.Stats,
        artifact.SubStats[1]?.Value,
        artifact.SubStats[1]?.Roll,
        artifact.SubStats[1]?.Rune,
        artifact.SubStats[2]?.Stats,
        artifact.SubStats[2]?.Value,
        artifact.SubStats[2]?.Roll,
        artifact.SubStats[2]?.Rune,
        artifact.SubStats[3]?.Stats,
        artifact.SubStats[3]?.Value,
        artifact.SubStats[3]?.Roll,
        artifact.SubStats[3]?.Rune,
      ].map((v) => (v !== undefined ? String(v) : ""));
    });

    const header = [
      "slot",
      "set_or_clan",
      "quality",
      "rarity",
      "lvl",
      "champion",
      "main_stat",
      "main_value",
      "sub_stat_1",
      "sub_value_1",
      "sub_rolls_1",
      "sub_rune_1",
      "sub_stat_2",
      "sub_value_2",
      "sub_rolls_2",
      "sub_rune_2",
      "sub_stat_3",
      "sub_value_3",
      "sub_rolls_3",
      "sub_rune_3",
      "sub_stat_4",
      "sub_value_4",
      "sub_rolls_4",
      "sub_rune_4",
    ];

    return [header, ...rows];
  };

  const exportBackup = () => {
    const rowsChampions = exportChampions();
    const rowsArtifacts = exportArtifacts();

    exportCSV(
      [["v1"], ...rowsChampions, ["---"], ...rowsArtifacts],
      "raid-gear-optimizer.csv"
    );
  };

  const fileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 1) {
      const reader = new FileReader();
      reader.onload = (csv: ProgressEvent<FileReader>) => {
        setTextareaValue((csv.target?.result as string) ?? "");
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        {lang.btnImportBackup}
      </Button>
      <Button variant="success" onClick={exportBackup}>
        {lang.btnExportBackup}
      </Button>
      <Modal
        title={lang.titleImportCSV}
        content={
          <Stack>
            <span className="badge badge-danger">
              <strong>{lang.commonWarning}</strong>:{" "}
              {lang.messageImportOverrideData}
            </span>
            <div className="custom-file">
              <input
                type="file"
                className="custom-file-input"
                id="fileImport"
                accept="raid-gear-optimizer.csv"
                onChange={fileUpload}
              />
              <label className="custom-file-label" htmlFor="fileImport">
                {lang.optionChooseCSVFile}
              </label>
            </div>
            <Textarea
              value={textareaValue}
              onChange={(e) => {
                setTextareaValue(e.target.value);
              }}
            />
          </Stack>
        }
        show={showModalImport}
        onSave={onImport}
        onClose={handleClose}
      />
    </>
  );
};
