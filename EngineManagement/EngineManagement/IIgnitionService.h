namespace EngineManagement
{
	class IIgnitionService
	{
	public:
		virtual void CoilDwell() = 0;
		virtual void CoilFire() = 0;
		static void CoilDwellTask(void *parameters);
		static void CoilFireTask(void *parameters);
	};
}