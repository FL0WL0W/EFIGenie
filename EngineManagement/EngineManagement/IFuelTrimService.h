
namespace EngineManagement
{
	class IFuelTrimService
	{
	public:
		virtual short GetFuelTrim(uint8_t cylinder) = 0;
	};
}