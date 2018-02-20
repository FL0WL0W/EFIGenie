namespace EngineManagement
{
	class ITpsService
	{
	public:
		virtual void ReadTps() = 0;
		float Tps = 0;
		float TpsDot = 0;
	};
}