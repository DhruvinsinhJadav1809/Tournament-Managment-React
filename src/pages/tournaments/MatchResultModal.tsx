import { useFormik } from "formik";
import * as Yup from "yup";
import { Trophy } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import type { Match } from "@/api/matches";

interface Props {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    matchId: string,
    payload: { player1Score: number; player2Score: number; winnerId: string },
  ) => void;
  isLoading: boolean;
}

export default function MatchResultModal({
  match,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const formik = useFormik({
    initialValues: {
      player1Score: 0,
      player2Score: 0,
      winnerId: "",
    },
    validationSchema: Yup.object({
      player1Score: Yup.number()
        .min(0, "Cannot be negative")
        .required("Required"),
      player2Score: Yup.number()
        .min(0, "Cannot be negative")
        .required("Required"),
      winnerId: Yup.string()
        .required("Please select a winner")
        .test(
          "winner-score-greater",
          "Winner must have a higher score than the loser",
          function (winnerId) {
            const { player1Score, player2Score } = this.parent;
            if (!winnerId || !match) return true;
            if (winnerId === match.player1Id) {
              return Number(player1Score) > Number(player2Score);
            }
            if (winnerId === match.player2Id) {
              return Number(player2Score) > Number(player1Score);
            }
            return true;
          },
        ),
    }),
    onSubmit: (values) => {
      if (!match) return;
      onSubmit(match.matchId, {
        player1Score: Number(values.player1Score),
        player2Score: Number(values.player2Score),
        winnerId: values.winnerId,
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  if (!match) return null;

  const player1 = { id: match.player1Id!, name: match.player1Name! };
  const player2 = { id: match.player2Id!, name: match.player2Name! };

  const winnerOptions = [
    { value: player1.id, label: player1.name },
    { value: player2.id, label: player2.name },
  ];

  // highlight selected winner's score row
  const p1IsWinner = formik.values.winnerId === player1.id;
  const p2IsWinner = formik.values.winnerId === player2.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Match Result"
      subtitle={`Match #${match.matchNumber}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<Trophy size={15} />}
            onClick={() => formik.handleSubmit()}
            isLoading={isLoading}
          >
            Save Result
          </Button>
        </>
      }
    >
      <form noValidate className="space-y-5">
        {/* Score inputs */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Scores
          </p>

          {/* Player 1 score */}
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              p1IsWinner
                ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-gray-100 bg-gray-50 dark:bg-zinc-800/50 dark:border-zinc-700/50"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                  {player1.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {player1.name}
                </span>
                {p1IsWinner && (
                  <Trophy size={13} className="text-amber-500 ml-auto" />
                )}
              </div>
              <Input
                type="number"
                min={0}
                placeholder="Score"
                {...formik.getFieldProps("player1Score")}
                error={
                  formik.touched.player1Score
                    ? formik.errors.player1Score
                    : undefined
                }
              />
            </div>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-bold text-gray-300 dark:bg-zinc-800/50 tracking-widest">
              VS
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Player 2 score */}
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              p2IsWinner
                ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-gray-100 bg-gray-50 dark:bg-zinc-800/50 dark:border-zinc-700/50"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                  {player2.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {player2.name}
                </span>
                {p2IsWinner && (
                  <Trophy size={13} className="text-amber-500 ml-auto" />
                )}
              </div>
              <Input
                type="number"
                min={0}
                placeholder="Score"
                {...formik.getFieldProps("player2Score")}
                error={
                  formik.touched.player2Score
                    ? formik.errors.player2Score
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Winner dropdown */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Winner
          </p>
          <Select
            label=""
            options={winnerOptions}
            placeholder="Select winner"
            value={formik.values.winnerId}
            onChange={(e) => formik.setFieldValue("winnerId", e.target.value)}
            error={formik.touched.winnerId ? formik.errors.winnerId : undefined}
          />
        </div>
      </form>
    </Modal>
  );
}
