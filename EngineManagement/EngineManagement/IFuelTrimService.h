#define IFuelTrimServiceExists
namespace EngineManagement
{
	class IFuelTrimService
	{
	public:
		//returns 1/128 %
		virtual short GetFuelTrim(unsigned char cylinder) = 0;
		virtual void TrimTick() = 0;
	};

	extern IFuelTrimService *CurrentFuelTrimService;

	IFuelTrimService *CreateFuelTrimService(void *config);
}