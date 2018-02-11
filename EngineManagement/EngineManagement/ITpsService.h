namespace EngineManagement
{
	class ITpsService
	{
	public:
		virtual void ReadTps() = 0;
		float Tps;
		float TpsDot;
	};
}