namespace Decoder
{
	enum EdgeTrigger
	{
		Up,
		Down
	};
	
	class IDecoder
	{
	public:
		virtual float GetCrankPosition(void) = 0;
		virtual float GetCamPosition(void) = 0;
		virtual unsigned int GetTickPerDegree(void) = 0;
		virtual unsigned short GetRpm(void) = 0;
		virtual void CrankEdgeTrigger(EdgeTrigger edgeTrigger) = 0;
		virtual void CamEdgeTrigger(EdgeTrigger edgeTrigger) = 0;
		virtual bool IsSynced() = 0;
		virtual bool HasCamPosition() = 0;
	};
}